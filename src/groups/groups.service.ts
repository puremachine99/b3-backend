import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateGroupDto) {
    return this.prisma.group.create({ data });
  }

  async findAll() {
    return this.prisma.group.findMany({
      include: { memberships: { include: { device: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.group.findUnique({
      where: { id },
      include: { memberships: { include: { device: true } } },
    });
  }

  async update(id: string, data: UpdateGroupDto) {
    return this.prisma.group.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.group.delete({ where: { id } });
  }

  /**
   * Attach device using device.id (NOT serialNumber)
   */
  async addDevice(groupId: string, deviceId: string) {
    const [group, device] = await Promise.all([
      this.prisma.group.findUnique({ where: { id: groupId }, select: { id: true } }),
      this.prisma.device.findUnique({ where: { id: deviceId }, select: { id: true } }),
    ]);

    if (!group) {
      throw new NotFoundException(`Group with id ${groupId} not found`);
    }

    if (!device) {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }

    const existingMembership = await this.prisma.deviceGroupMembership.findUnique({
      where: { deviceId_groupId: { deviceId: device.id, groupId: group.id } },
    });

    if (existingMembership) {
      throw new ConflictException('Device already attached to this group');
    }

    return this.prisma.deviceGroupMembership.create({
      data: { groupId: group.id, deviceId: device.id },
    });
  }

  /**
   * Detach device using device.id
   */
  async removeDevice(groupId: string, deviceId: string) {
    const [group, device] = await Promise.all([
      this.prisma.group.findUnique({ where: { id: groupId }, select: { id: true } }),
      this.prisma.device.findUnique({ where: { id: deviceId }, select: { id: true } }),
    ]);

    if (!group) {
      throw new NotFoundException(`Group with id ${groupId} not found`);
    }

    if (!device) {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }

    const deleted = await this.prisma.deviceGroupMembership.deleteMany({
      where: { groupId: group.id, deviceId: device.id },
    });

    if (!deleted.count) {
      throw new NotFoundException('Device is not attached to this group');
    }

    return deleted;
  }

  async listDevices(groupId: string) {
    const group = await this.prisma.group.findUnique({ where: { id: groupId }, select: { id: true } });

    if (!group) {
      throw new NotFoundException(`Group with id ${groupId} not found`);
    }

    return this.prisma.deviceGroupMembership.findMany({
      where: { groupId: group.id },
      select: {
        id: true,
        groupId: true,
        deviceId: true,
        createdAt: true,
        device: {
          select: {
            id: true,
            serialNumber: true,
            name: true,
            description: true,
            location: true,
            status: true,
            latitude: true,
            longitude: true,
            lastSeenAt: true,
          },
        },
      },
    });
  }
}
