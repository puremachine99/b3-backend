import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/auth.decorator';
import { Role } from '@prisma/client';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':serialNumber')
  findOne(@Param('serialNumber') serialNumber: string) {
    return this.devicesService.findOne(serialNumber);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  create(@Body() body: any) {
    return this.devicesService.create(body);
  }

  @Patch(':serialNumber')
  @Roles(Role.ADMIN, Role.OPERATOR)
  update(
    @Param('serialNumber') serialNumber: string,
    @Body() body: any,
  ) {
    return this.devicesService.update(serialNumber, body);
  }

  @Delete(':serialNumber')
  @Roles(Role.ADMIN)
  remove(@Param('serialNumber') serialNumber: string) {
    return this.devicesService.remove(serialNumber);
  }

  @Post(':serialNumber/cmd')
  @Roles(Role.ADMIN, Role.OPERATOR)
  sendCommand(
    @Param('serialNumber') serialNumber: string,
    @Body() body: any,
  ) {
    return this.devicesService.sendCommand(serialNumber, body.payload);
  }
}
