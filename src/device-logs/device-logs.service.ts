import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DeviceLogsService {
  private readonly logger = new Logger(DeviceLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: {
    deviceId: string;
    eventType: 'COMMAND' | 'STATUS' | 'ERROR' | 'SYSTEM';
    command?: string;
    payload?: any;
    userId?: string;
  }) {
    try {
      const log = await this.prisma.deviceLog.create({
        data: {
          deviceId: data.deviceId,
          userId: data.userId,
          eventType: data.eventType,
          command: data.command,
          payload: data.payload,
        },
      });
      this.logger.log(
        `🧾 Log saved for ${data.deviceId}: ${data.eventType} (${data.command ?? ''})`,
      );
      return log;
    } catch (err) {
      this.logger.error('❌ Failed to create log: ' + err.message);
      throw err;
    }
  }

  async getLogsByDevice(deviceId: string) {
    return this.prisma.deviceLog.findMany({
      where: { deviceId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
