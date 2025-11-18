import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { DeviceStatus, LogType } from '@prisma/client';

@Injectable()
export class DeviceLogsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeviceLogsService.name);
  private cleanupInterval?: NodeJS.Timeout;
  private readonly retentionDays: number;
  private readonly cleanupIntervalHours: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.retentionDays = Number(this.config.get('DEVICE_LOG_RETENTION_DAYS') ?? 30);
    this.cleanupIntervalHours = Number(
      this.config.get('DEVICE_LOG_CLEANUP_INTERVAL_HOURS') ?? 24,
    );
  }

  onModuleInit() {
    if (this.cleanupIntervalHours > 0) {
      this.cleanupInterval = setInterval(
        () => this.cleanupOldLogs().catch((err) => this.logger.error(err.message)),
        this.cleanupIntervalHours * 60 * 60 * 1000,
      );
    }
  }

  onModuleDestroy() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  }

  async createLog(data: {
    deviceId?: string;
    deviceSerial?: string;
    eventType: LogType;
    command?: string;
    payload?: any;
    userId?: string;
  }) {
    try {
      const resolvedDeviceId = await this.resolveDeviceId(data.deviceId, data.deviceSerial);

      // Ensure provided user exists; otherwise avoid FK violation by omitting it
      let userId: string | undefined = data.userId;
      if (userId) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        });
        if (!userExists) {
          this.logger.warn(`User ${userId} not found; omitting from log entry`);
          userId = undefined;
        }
      }

      const log = await this.prisma.deviceLog.create({
        data: {
          deviceId: resolvedDeviceId,
          userId,
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

  async getLogsByDevice(deviceIdOrSerial: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        OR: [{ id: deviceIdOrSerial }, { serialNumber: deviceIdOrSerial }],
      },
      select: { id: true },
    });
    if (!device) {
      return [];
    }

    const items = await this.prisma.deviceLog.findMany({
      where: { deviceId: device.id },
      orderBy: { createdAt: 'asc' },
    });

    return items;
  }

  async cleanupOldLogs(retentionOverride?: number) {
    const retentionDays = retentionOverride ?? this.retentionDays;
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const result = await this.prisma.deviceLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (result.count > 0) {
      this.logger.log(`♻️ Cleaned ${result.count} logs older than ${retentionDays} days.`);
    }
    return result.count;
  }

  private async resolveDeviceId(deviceId?: string, deviceSerial?: string) {
    if (deviceId) {
      const existing = await this.prisma.device.findUnique({
        where: { id: deviceId },
        select: { id: true },
      });
      if (existing) return existing.id;
    }

    const serialKey = deviceSerial ?? deviceId;
    if (!serialKey) throw new Error('deviceSerial or deviceId is required to create log');

    const device = await this.prisma.device.upsert({
      where: { serialNumber: serialKey },
      update: {},
      create: {
        serialNumber: serialKey,
        name: serialKey,
        status: DeviceStatus.OFFLINE,
      },
    });

    return device.id;
  }
}
