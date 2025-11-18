import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/auth.decorator';
import { Role } from '@prisma/client';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
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
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(@Param('id') id: string, @Body() data: UpdateGroupDto) {
    return this.groupsService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Post(':id/devices/:deviceId')
  @Roles(Role.ADMIN, Role.OPERATOR)
  addDevice(@Param('id') groupId: string, @Param('deviceId') deviceId: string) {
    return this.groupsService.addDevice(groupId, deviceId);
  }

  @Delete(':id/devices/:deviceId')
  @Roles(Role.ADMIN, Role.OPERATOR)
  removeDevice(@Param('id') groupId: string, @Param('deviceId') deviceId: string) {
    return this.groupsService.removeDevice(groupId, deviceId);
  }

  @Get(':id/devices')
  listDevices(@Param('id') groupId: string) {
    return this.groupsService.listDevices(groupId);
  }
}
