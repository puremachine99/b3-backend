import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/auth.decorator';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Get(':id/status')
  findStatus(@Param('id') id: string) {
    return this.devicesService.getStatus(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() body: CreateDeviceDto) {
    return this.devicesService.create(body);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id') id: string,
    @Body() body: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }

  @Post(':serialNumber/cmd')
  @Roles(Role.ADMIN, Role.OPERATOR)
  sendCommand(
    @Param('serialNumber') serialNumber: string,
    @Body() body: any,
    @Req() req: Request & { user?: any },
  ) {
    // Accept either { payload: ... }, { command: ... }, or raw bodies; if a command object is provided, send its command field as plain text
    let payload: any = body;
    if (body && typeof body === 'object') {
      if ('payload' in body) {
        const inner = (body as any).payload;
        payload = inner && typeof inner === 'object' && typeof inner.command === 'string' ? inner.command : inner;
      } else if ('command' in body && typeof (body as any).command === 'string') {
        payload = (body as any).command;
      }
    }

    return this.devicesService.sendCommand(
      serialNumber,
      payload,
      req.user?.sub,
    );
  }
}
