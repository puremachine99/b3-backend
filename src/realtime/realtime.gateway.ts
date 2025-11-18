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
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastDeviceStatus(deviceId: string, payload: any) {
    this.server.to(deviceId).emit('device-status', { deviceId, ...payload });
    this.logger.debug(`Broadcasted status for device ${deviceId}`);
  }

  broadcastDeviceConnection(deviceId: string, status: string) {
    this.server.to(deviceId).emit('device-connection', { deviceId, status });
    this.logger.debug(`Broadcasted connection for device ${deviceId}: ${status}`);
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
    this.server.to(log.deviceId).emit('device-log', log);
    this.logger.debug(`Broadcasted device log for ${log.deviceId}: ${log.type}`);
  }

  broadcastDeviceAvailability(deviceId: string, available: boolean) {
    this.server.to(deviceId).emit('device-availability', { deviceId, available });
    this.logger.debug(
      `Broadcasted availability for device ${deviceId}: ${available ? 'AVAILABLE' : 'UNAVAILABLE'}`,
    );
  }

  @SubscribeMessage('join-device')
  handleJoin(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: any,
  ) {
    if (!data?.deviceId) return;
    client.join(data.deviceId);
    this.logger.log(`Client ${client.id} joined device room ${data.deviceId}`);
  }

  @SubscribeMessage('leave-device')
  handleLeave(
    @MessageBody() data: { deviceId: string },
    @ConnectedSocket() client: any,
  ) {
    if (!data?.deviceId) return;
    client.leave(data.deviceId);
    this.logger.log(`Client ${client.id} left device room ${data.deviceId}`);
  }
}
