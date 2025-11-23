import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MqttService } from '../mqtt/mqtt.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class CommandsService {
  private readonly logger = new Logger(CommandsService.name);

  constructor(
    private prisma: PrismaService,
    private mqtt: MqttService,
    private groups: GroupsService,
  ) {}

  async sendToDevice(deviceId: string, payload: any) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
      select: { id: true, serialNumber: true },
    });

    if (!device) {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }

    await this.prisma.deviceCommand.create({
      data: {
        commandId: `cmd_${Date.now()}`,
        type: 'device',
        payload,
        targetType: 'device',
        target: device.id,
        status: 'SENT',
      },
    });

    this.mqtt.publishCommand(device.serialNumber, payload);
    this.logger.log(`Sent command to ${device.id}`);
  }

  async sendToGroup(groupId: string, payload: any) {
    const members = await this.groups.listDevices(groupId);
    for (const member of members) {
      await this.sendToDevice(member.deviceId, payload);
    }
    return { success: true, count: members.length };
  }
}
