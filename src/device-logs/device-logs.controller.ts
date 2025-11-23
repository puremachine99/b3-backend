import { Controller, Get, Param } from '@nestjs/common';
import { DeviceLogsService } from './device-logs.service';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Device Logs')
@Controller('device-logs')
export class DeviceLogsController {
  constructor(private readonly logsService: DeviceLogsService) {}

  @Get(':deviceId')
  @ApiOperation({ summary: 'List telemetry/command logs for a particular device' })
  @ApiParam({ name: 'deviceId', description: 'Device identifier' })
  @ApiOkResponse({ description: 'Chronological logs ordered from newest to oldest' })
  async getDeviceLogs(@Param('deviceId') deviceId: string) {
    return this.logsService.getLogsByDevice(deviceId);
  }
}
