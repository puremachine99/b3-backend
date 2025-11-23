import { Controller, Post, Param, Body } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { SendCommandDto } from './dto/send-command.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Commands')
@Controller('commands')
export class CommandsController {
  constructor(private commandsService: CommandsService) {}

  @Post('/device/:id')
  @ApiOperation({ summary: 'Broadcast a command payload to a single device channel' })
  @ApiParam({ name: 'id', description: 'Device ID (not serial number)' })
  @ApiBody({ type: SendCommandDto })
  @ApiOkResponse({ description: 'Command published to the device-specific topic' })
  sendToDevice(@Param('id') id: string, @Body() dto: SendCommandDto) {
    return this.commandsService.sendToDevice(id, dto);
  }

  @Post('/group/:id')
  @ApiOperation({ summary: 'Publish a command payload to all devices in a group' })
  @ApiParam({ name: 'id', description: 'Group identifier' })
  @ApiBody({ type: SendCommandDto })
  @ApiOkResponse({ description: 'Command published to the group topic' })
  sendToGroup(@Param('id') id: string, @Body() dto: SendCommandDto) {
    return this.commandsService.sendToGroup(id, dto);
  }
}
