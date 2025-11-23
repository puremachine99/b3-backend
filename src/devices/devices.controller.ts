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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Devices')
@ApiBearerAuth()
@Controller('devices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({ summary: 'List all registered devices' })
  @ApiOkResponse({ description: 'Array of devices returned from the database' })
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single device by ID' })
  @ApiParam({ name: 'id', description: 'Device identifier from database' })
  @ApiOkResponse({ description: 'Device data when found' })
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Retrieve last known connectivity status of a device' })
  @ApiParam({ name: 'id', description: 'Device identifier from database' })
  @ApiOkResponse({ description: 'Status value based on logs or MQTT presence' })
  findStatus(@Param('id') id: string) {
    return this.devicesService.getStatus(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OPERATOR)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Register a new device' })
  @ApiBody({ type: CreateDeviceDto })
  @ApiCreatedResponse({ description: 'Device successfully created' })
  create(@Body() body: CreateDeviceDto) {
    return this.devicesService.create(body);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update device information' })
  @ApiParam({ name: 'id', description: 'Device identifier from database' })
  @ApiBody({ type: UpdateDeviceDto })
  @ApiOkResponse({ description: 'Updated device payload' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a device permanently' })
  @ApiParam({ name: 'id', description: 'Device identifier from database' })
  @ApiOkResponse({ description: 'Deletion acknowledgement' })
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }

  @Post(':serialNumber/cmd')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Relay a command to a device topic' })
  @ApiParam({ name: 'serialNumber', description: 'Hardware serial number used as MQTT topic suffix' })
  @ApiBody({
    description: 'Provide either { payload }, { command }, or a raw string body to be sent to MQTT',
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            payload: { type: 'object', additionalProperties: true },
          },
        },
        {
          type: 'object',
          properties: {
            command: { type: 'string' },
          },
        },
        { type: 'string' },
      ],
    },
  })
  @ApiOkResponse({ description: 'Command queued to MQTT broker' })
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
