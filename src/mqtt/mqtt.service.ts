import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { ConfigService } from '@nestjs/config';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { DeviceLogsService } from '../device-logs/device-logs.service';
import { DeviceStatus, LogType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class MqttService implements OnModuleInit {
  private client: MqttClient;
  private readonly logger = new Logger(MqttService.name);
  private connected = false;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private publishQueue: Array<{
    topic: string;
    payload: string | Buffer;
    attempts: number;
  }> = [];

  constructor(
    private config: ConfigService,
    private realtimeGateway: RealtimeGateway,
    private deviceLogs: DeviceLogsService,
    private prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.connect();
  }

  // Build a human-readable summary for websocket consumers; keeps raw payload as-is
  private buildReadableLog(type: string, message: string, payload: any) {
    const summarize = (value: any) => {
      if (value === undefined || value === null) return '';
      if (typeof value === 'string') return value.slice(0, 200);
      try {
        return JSON.stringify(value).slice(0, 200);
      } catch {
        return String(value).slice(0, 200);
      }
    };

    const makeDetailString = (data: Record<string, any>) =>
      Object.entries(data)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ');

    if (type === 'STATUS' && payload && typeof payload === 'object') {
      const relay = payload.relay_state ?? payload.relay ?? payload.relayState;
      const detail = makeDetailString({
        last_seen: payload.last_seen ?? payload.lastSeen,
        relay_state: relay,
        serial_number: payload.serial_number ?? payload.serialNumber,
        device_connection: payload.device_connection ?? payload.connection ?? payload.status,
      });
      const summaryParts = ['STATUS', message, relay ? `relay=${relay}` : undefined].filter(Boolean);
      return {
        displaySummary: summaryParts.join(' · '),
        displayDetail: detail,
      };
    }

    if (type === 'LWT') {
      return {
        displaySummary: `LWT · ${message}`,
        displayDetail: `device_connection: ${payload ?? ''}`,
      };
    }

    return {
      displaySummary: `${type} · ${message}`,
      displayDetail:
        typeof payload === 'object' ? makeDetailString(payload) : summarize(payload),
    };
  }

  private connect() {
    const rawUrl = this.config.get<string>('MQTT_URL');
    if (!rawUrl) throw new Error('MQTT_URL not set in environment');

    // Allow host:port input; prepend mqtt:// when missing a protocol
    const mqttUrl = rawUrl.startsWith('mqtt://') || rawUrl.startsWith('ws://') || rawUrl.startsWith('wss://')
      ? rawUrl
      : `mqtt://${rawUrl}`;

    this.logger.log(`Connecting to MQTT: ${mqttUrl}`);
    this.client = connect(mqttUrl);

    this.client.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.logger.log(`Connected to MQTT: ${mqttUrl}`);
      this.client.subscribe('device/+/status', { qos: 1 }, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe device/+/status: ${err.message}`);
        } else {
          this.logger.log('Subscribed to device/+/status');
        }
      });
      this.client.subscribe('device/+/lwt', { qos: 1 }, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe device/+/lwt: ${err.message}`);
        } else {
          this.logger.log('Subscribed to device/+/lwt');
        }
      });
      this.flushQueue();
      this.startHeartbeat();
    });

    this.client.on('reconnect', () => {
      this.logger.warn('Reconnecting to MQTT broker...');
    });

    this.client.on('close', () => {
      this.connected = false;
      this.logger.warn('MQTT connection closed');
      this.stopHeartbeat();
      this.scheduleReconnect();
    });

    this.client.on('error', (err) => {
      this.connected = false;
      this.logger.error(`MQTT error: ${err.message}`);
      this.stopHeartbeat();
      this.scheduleReconnect();
    });

    this.client.on('message', async (topic, payload) => {
      const parts = topic.split('/');
      const deviceId = parts[1];
      const event = parts[2];
      this.logger.debug(`MQTT message ${topic} => ${payload.toString().slice(0, 200)}`);

      if (event === 'status') {
        const raw = payload.toString();
        let parsed: any = raw;
        try {
          parsed = JSON.parse(raw);
        } catch {
          this.logger.warn(`Status payload not JSON for ${deviceId}, storing raw text`);
        }

        // Broadcast realtime (even if raw string)
        const statusPayload = this.normalizeStatusPayload(parsed, deviceId);
        const readable = this.buildReadableLog('STATUS', 'Status update received', statusPayload);
        this.realtimeGateway.broadcastDeviceStatus(deviceId, statusPayload);
        this.realtimeGateway.broadcastDeviceLog({
          deviceId,
          type: 'STATUS',
          message: readable.displaySummary,
          payload: parsed,
          display: readable,
          createdAt: new Date().toISOString(),
        });

        // Persist to DB with raw/parsed payload
        await this.deviceLogs.createLog({
          deviceSerial: deviceId,
          eventType: LogType.STATUS,
          command: 'Status update received',
          payload: { raw: parsed, normalized: statusPayload },
        });
      } else if (event === 'lwt') {
        const status = payload.toString().trim();
        this.logger.log(`LWT received for device ${deviceId}: ${status}`);
        // Broadcast LWT to websocket so frontend can show real-time connection status
        this.realtimeGateway.broadcastDeviceConnection(deviceId, status);
        this.realtimeGateway.broadcastDeviceAvailability(deviceId, status.toUpperCase() !== 'OFFLINE');
        this.realtimeGateway.broadcastDeviceStatus(deviceId, { status });
        const readable = this.buildReadableLog('LWT', `Device connection ${status}`, status);
        this.realtimeGateway.broadcastDeviceLog({
          deviceId,
          type: 'LWT',
          message: readable.displaySummary,
          payload: status,
          display: readable,
          createdAt: new Date().toISOString(),
        });
        await this.deviceLogs.createLog({
          deviceSerial: deviceId,
          eventType: status.toUpperCase() === 'OFFLINE' ? LogType.ERROR : LogType.SYSTEM,
          command: 'LWT',
          payload: status,
        });

        // Update device status in DB so REST consumers stay in sync
        const normalized = status.toUpperCase() === 'ONLINE' ? DeviceStatus.ONLINE : DeviceStatus.OFFLINE;
        await this.prisma.device.upsert({
          where: { serialNumber: deviceId },
          update: { status: normalized, lastSeenAt: new Date() },
          create: {
            serialNumber: deviceId,
            name: deviceId,
            status: normalized,
            lastSeenAt: new Date(),
          },
        });
      }
    });
  }

  publishCommand(serialNumber: string, command: any) {
    const topic = `device/${serialNumber}/cmd`;
    const payload =
      typeof command === 'string' || Buffer.isBuffer(command)
        ? command
        : JSON.stringify(command);

    if (!this.connected) {
      this.logger.warn(
        `MQTT not connected; queueing command for ${serialNumber}`,
      );
      this.publishQueue.push({ topic, payload: Buffer.from(payload), attempts: 0 });
      return;
    }

    this.publishWithRetry(topic, payload);
  }

  isConnected() {
    return this.connected;
  }

  private normalizeStatusPayload(payload: any, deviceId: string) {
    if (!payload || typeof payload !== 'object') {
      return { message: String(payload ?? ''), deviceId };
    }
    return {
      relay:
        payload.relay ?? payload.relay_state ?? payload.relayState ?? null,
      lastSeen:
        payload.last_seen ?? payload.lastSeen ?? payload.lastSeenAt ?? null,
      serial:
        payload.serial_number ?? payload.serialNumber ?? payload.serial ?? deviceId,
      connection:
        payload.device_connection ??
        payload.connection ??
        payload.status ??
        null,
      raw: payload,
    };
  }

  private startHeartbeat() {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(() => {
      if (this.connected && this.client?.connected) {
        this.logger.debug('MQTT heartbeat ok');
      } else {
        this.logger.warn('MQTT heartbeat detected disconnect; scheduling reconnect');
        this.scheduleReconnect();
      }
    }, 15000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect() {
    if (!this.client || this.client.reconnecting) return;
    const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);
    this.reconnectAttempts += 1;
    this.logger.warn(
      `MQTT reconnect attempt #${this.reconnectAttempts} in ${delay}ms`,
    );
    setTimeout(() => {
      if (this.client?.connected) return;
      this.logger.log('Attempting MQTT reconnect');
      this.connect();
    }, delay);
  }

  private flushQueue() {
    if (!this.connected || !this.publishQueue.length) return;
    const queued = [...this.publishQueue];
    this.publishQueue = [];
    queued.forEach(({ topic, payload }) => {
      this.publishWithRetry(topic, payload);
    });
  }

  private publishWithRetry(topic: string, payload: string | Buffer, attempt = 0) {
    const preview =
      typeof payload === 'string'
        ? payload.slice(0, 200)
        : payload.toString().slice(0, 200);
    if (!this.client || !this.connected) {
      this.logger.warn(
        `Publish deferred (not connected) to ${topic}; attempt ${attempt}`,
      );
      this.publishQueue.push({ topic, payload, attempts: attempt });
      return;
    }

    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        const nextAttempt = attempt + 1;
        const delay = Math.min(30000, Math.pow(2, nextAttempt) * 100);
        this.logger.error(
          `Publish failed to ${topic} (attempt ${nextAttempt}): ${err.message}; retrying in ${delay}ms`,
        );
        setTimeout(() => {
          this.publishWithRetry(topic, payload, nextAttempt);
        }, delay);
      } else {
        this.logger.log(`Published to ${topic} payload=${preview}`);
      }
    });
  }
}
