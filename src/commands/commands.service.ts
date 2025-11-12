import { Injectable, Logger } from '@nestjs/common';
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
    await this.prisma.deviceCommand.create({
      data: {
        commandId: `cmd_${Date.now()}`,
        type: 'device',
        payload,
        targetType: 'device',
        target: deviceId,
        status: 'SENT',
      },
    });

    this.mqtt.publishCommand(deviceId, payload);
    this.logger.log(`Sent command to ${deviceId}`);
  }

  async sendToGroup(groupId: string, payload: any) {
    const members = await this.groups.listDevices(groupId);
    for (const member of members) {
      await this.sendToDevice(member.deviceId, payload);
    }
    return { success: true, count: members.length };
  }
}
