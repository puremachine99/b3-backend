import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceLogsService } from '../device-logs/device-logs.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { LogType } from '@prisma/client';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);
  constructor(
    private prisma: PrismaService,
    private mqtt: MqttService,
    private deviceLogs: DeviceLogsService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findAll() {
    return this.prisma.device.findMany();
  }

  async findOne(identifier: string) {
    return this.prisma.device.findFirst({
      where: { OR: [{ id: identifier }, { serialNumber: identifier }] },
    });
  }

  async getStatus(identifier: string) {
    const device = await this.prisma.device.findFirst({
      where: { OR: [{ id: identifier }, { serialNumber: identifier }] },
      select: { id: true, serialNumber: true, status: true, lastSeenAt: true, updatedAt: true },
    });
    if (!device) {
      throw new NotFoundException(`Device ${identifier} not found`);
    }
    return device;
  }

  async create(data: CreateDeviceDto) {
    return this.prisma.device.create({ data });
  }

  async update(id: string, data: UpdateDeviceDto) {
    return this.prisma.device.update({
      where: { id },
      data,
    });
  }

  async remove(identifier: string) {
    const device = await this.prisma.device.findFirst({
      where: { OR: [{ id: identifier }, { serialNumber: identifier }] },
      select: { id: true },
    });

    if (!device) {
      throw new NotFoundException(`Device ${identifier} not found`);
    }

    return this.prisma.device.delete({
      where: { id: device.id },
    });
  }

  async sendCommand(serialNumber: string, payload: any, userId?: string) {
    const device = await this.prisma.device.findUnique({
      where: { serialNumber },
    });
    if (!device) {
      throw new NotFoundException(`Device ${serialNumber} not found`);
    }

    this.logger.log(
      `sendCommand request for ${serialNumber} by ${userId ?? 'unknown user'}`,
    );

    await this.mqtt.publishCommand(serialNumber, payload);

    const commandLabel =
      typeof payload === 'string'
        ? payload
        : payload?.command ?? 'CUSTOM';

    await this.deviceLogs.createLog({
      deviceId: device.id,
      userId,
      eventType: LogType.COMMAND,
      command: commandLabel,
      payload,
    });

    // Emit websocket log
    this.realtimeGateway.broadcastDeviceLog({
      deviceId: serialNumber,
      type: 'COMMAND',
      message: `Command sent by ${userId ?? 'unknown'}`,
      payload,
      userId,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  }
}
