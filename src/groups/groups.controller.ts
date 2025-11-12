import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  create(@Body() data: CreateGroupDto) {
    return this.groupsService.create(data);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateGroupDto) {
    return this.groupsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Post(':id/devices/:deviceId')
  addDevice(@Param('id') groupId: string, @Param('deviceId') deviceId: string) {
    return this.groupsService.addDevice(groupId, deviceId);
  }

  @Delete(':id/devices/:deviceId')
  removeDevice(@Param('id') groupId: string, @Param('deviceId') deviceId: string) {
    return this.groupsService.removeDevice(groupId, deviceId);
  }

  @Get(':id/devices')
  listDevices(@Param('id') groupId: string) {
    return this.groupsService.listDevices(groupId);
  }
}
