import { Injectable } from '@nestjs/common';
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

  async addDevice(groupId: string, deviceId: string) {
    return this.prisma.deviceGroupMembership.create({
      data: { groupId, deviceId },
    });
  }

  async removeDevice(groupId: string, deviceId: string) {
    return this.prisma.deviceGroupMembership.deleteMany({
      where: { groupId, deviceId },
    });
  }

  async listDevices(groupId: string) {
    return this.prisma.deviceGroupMembership.findMany({
      where: { groupId },
      include: { device: true },
    });
  }
}
