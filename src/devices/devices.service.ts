import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class DevicesService {
  constructor(
    private prisma: PrismaService,
    private mqtt: MqttService,
  ) {}

  async findAll() {
    return this.prisma.device.findMany();
  }

  async findOne(serialNumber: string) {
    return this.prisma.device.findUnique({
      where: { serialNumber },
    });
  }

  async create(data: any) {
    return this.prisma.device.create({ data });
  }

  async update(serialNumber: string, data: any) {
    return this.prisma.device.update({
      where: { serialNumber },
      data,
    });
  }

  async remove(serialNumber: string) {
    return this.prisma.device.delete({
      where: { serialNumber },
    });
  }

  async sendCommand(serialNumber: string, payload: any) {
    // Publish ke MQTT topic pakai serialNumber
    await this.mqtt.publishCommand(serialNumber, payload);
    return { success: true };
  }
}
