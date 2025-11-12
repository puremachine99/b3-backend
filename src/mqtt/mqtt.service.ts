import { Injectable, Logger } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';
import { ConfigService } from '@nestjs/config';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class MqttService {
  private client: MqttClient;
  private readonly logger = new Logger(MqttService.name);

  constructor(
    private config: ConfigService,
    private realtimeGateway: RealtimeGateway,
  ) {
    this.connect();
  }

  private connect() {
    const mqttUrl = this.config.get<string>('MQTT_URL');
    if (!mqttUrl) throw new Error('MQTT_URL not set in environment');

    this.client = connect(mqttUrl);

    this.client.on('connect', () => {
      this.logger.log(`Connected to MQTT: ${mqttUrl}`);
      this.client.subscribe('laundry/+/status');
    });

    this.client.on('message', (topic, payload) => {
      try {
        const message = JSON.parse(payload.toString());
        const [, deviceId] = topic.split('/');
        this.realtimeGateway.broadcastDeviceStatus(deviceId, message);
      } catch (e) {
        this.logger.error(`Invalid MQTT message: ${e.message}`);
      }
    });
  }

  publishCommand(serialNumber: string, command: any) {
    const topic = `laundry/${serialNumber}/cmd`;
    this.client.publish(topic, JSON.stringify(command));
    this.logger.log(`Published to ${topic}`);
  }
}
