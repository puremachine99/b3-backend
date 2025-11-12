import { Controller, Get, Param } from '@nestjs/common';
import { DeviceLogsService } from './device-logs.service';

@Controller('device-logs')
export class DeviceLogsController {
  constructor(private readonly logsService: DeviceLogsService) {}

  @Get(':deviceId')
  async getDeviceLogs(@Param('deviceId') deviceId: string) {
    return this.logsService.getLogsByDevice(deviceId);
  }
}
