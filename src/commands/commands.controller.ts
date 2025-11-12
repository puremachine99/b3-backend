import { Controller, Post, Param, Body } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { SendCommandDto } from './dto/send-command.dto';

@Controller('commands')
export class CommandsController {
  constructor(private commandsService: CommandsService) {}

  @Post('/device/:id')
  sendToDevice(@Param('id') id: string, @Body() dto: SendCommandDto) {
    return this.commandsService.sendToDevice(id, dto);
  }

  @Post('/group/:id')
  sendToGroup(@Param('id') id: string, @Body() dto: SendCommandDto) {
    return this.commandsService.sendToGroup(id, dto);
  }
}
