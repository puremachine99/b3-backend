// src/realtime/realtime.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';

const wsAllowedOriginsEnv =
  process.env.WS_ALLOWED_ORIGINS ??
  process.env.CORS_ALLOWED_ORIGINS ??
  'https://nopel.cloud,https://www.nopel.cloud,http://127.0.0.1:3000';
const wsAllowedOrigins = wsAllowedOriginsEnv
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: wsAllowedOrigins,
    credentials: true,
  },

  transports: ['websocket'], // ❗ WAJIB, Cloudflare tidak suka polling
  allowEIO3: true, // optional untuk stabilize
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private joinRateLimit = new Map<string, number>(); // socketId -> last join ts

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) throw new UnauthorizedException('Missing token');
      const payload = this.jwt.verify(token);
      (client as any).user = payload;
      this.logger.log(`Client connected: ${client.id} user=${payload?.sub ?? payload?.id ?? 'unknown'}`);
    } catch (err) {
      this.logger.warn(`Unauthorized WS connection ${client.id}: ${err instanceof Error ? err.message : err}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.joinRateLimit.delete(client.id);
  }

  broadcastDeviceStatus(deviceId: string, payload: any) {
    this.server
      .to(deviceId)
      .emit('device-status', { v: 1, deviceId, payload });
    this.logger.log(`Broadcasted status for device ${deviceId}`);
  }

  broadcastDeviceConnection(deviceId: string, status: string) {
    this.server
      .to(deviceId)
      .emit('device-connection', { v: 1, deviceId, status });
    this.logger.log(
      `Broadcasted connection for device ${deviceId}: ${status}`,
    );
  }

  broadcastDeviceLog(log: {
    deviceId: string;
    type: string;
    message?: string;
    payload?: any;
    userId?: string;
    createdAt?: string;
    display?: {
      displaySummary: string;
      displayDetail: string;
    };
  }) {
    this.server
      .to(log.deviceId)
      .emit('device-log', { v: 1, ...log });
    this.logger.log(
      `Broadcasted device log for ${log.deviceId}: ${log.type}`,
    );
  }

  broadcastDeviceAvailability(deviceId: string, available: boolean) {
    this.server
      .to(deviceId)
      .emit('device-availability', { v: 1, deviceId, available });
    this.logger.log(
      `Broadcasted availability for device ${deviceId}: ${available ? 'AVAILABLE' : 'UNAVAILABLE'}`,
    );
  }

  @SubscribeMessage('join-device')
  async handleJoin(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.deviceId) return;
    this.logger.log(`Join request from ${client.id} for ${data.deviceId}`);
    const now = Date.now();
    const last = this.joinRateLimit.get(client.id) ?? 0;
    if (now - last < 1000) {
      client.emit('error', { v: 1, code: 'RATE_LIMIT', message: 'Join too frequent' });
      return;
    }
    this.joinRateLimit.set(client.id, now);

    const user = (client as any).user;
    if (!user) {
      client.emit('error', { v: 1, code: 'UNAUTHORIZED', message: 'Missing token' });
      client.disconnect();
      return;
    }

    // Basic authZ: ensure device exists; extend with per-user checks as needed
    const device = await this.prisma.device.findUnique({
      where: { serialNumber: data.deviceId },
      select: { serialNumber: true, status: true, lastSeenAt: true },
    });
    if (!device) {
      client.emit('error', { v: 1, code: 'NOT_FOUND', message: 'Device not found' });
      return;
    }

    client.join(data.deviceId);
    this.logger.log(`Client ${client.id} joined device room ${data.deviceId}`);

    // Send snapshot status
    client.emit('device-status', {
      v: 1,
      deviceId: data.deviceId,
      payload: {
        status: device.status,
        lastSeenAt: device.lastSeenAt,
      },
    });
  }

  @SubscribeMessage('leave-device')
  handleLeave(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.deviceId) return;
    client.leave(data.deviceId);
    this.logger.log(`Client ${client.id} left device room ${data.deviceId}`);
  }
}
