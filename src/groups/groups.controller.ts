import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/auth.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a device group' })
  @ApiBody({ type: CreateGroupDto })
  @ApiOkResponse({ description: 'Newly created group payload' })
  create(@Body() data: CreateGroupDto) {
    return this.groupsService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all groups' })
  @ApiOkResponse({ description: 'Array of groups from database' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group details' })
  @ApiParam({ name: 'id', description: 'Group identifier' })
  @ApiOkResponse({ description: 'Group data' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update group information' })
  @ApiParam({ name: 'id', description: 'Group identifier' })
  @ApiBody({ type: UpdateGroupDto })
  @ApiOkResponse({ description: 'Updated group data' })
  update(@Param('id') id: string, @Body() data: UpdateGroupDto) {
    return this.groupsService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove a group' })
  @ApiParam({ name: 'id', description: 'Group identifier' })
  @ApiOkResponse({ description: 'Deletion acknowledgement' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Post(':id/devices/:deviceId')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Attach a device to a group' })
  @ApiParam({ name: 'id', description: 'Group identifier' })
  @ApiParam({ name: 'deviceId', description: 'Device ID (use database id, not serial)' })
  @ApiOkResponse({ description: 'Result of the association' })
  addDevice(@Param('id') groupId: string, @Param('deviceId') deviceId: string) {
    return this.groupsService.addDevice(groupId, deviceId);
  }

  @Delete(':id/devices/:deviceId')
  @Roles(Role.ADMIN, Role.OPERATOR)
  @ApiOperation({ summary: 'Detach a device from a group' })
  @ApiParam({ name: 'id', description: 'Group identifier' })
  @ApiParam({ name: 'deviceId', description: 'Device ID (use database id, not serial)' })
  @ApiOkResponse({ description: 'Result of the disassociation' })
  removeDevice(@Param('id') groupId: string, @Param('deviceId') deviceId: string) {
    return this.groupsService.removeDevice(groupId, deviceId);
  }

  @Get(':id/devices')
  @ApiOperation({ summary: 'List device-group membership rows for a group' })
  @ApiParam({ name: 'id', description: 'Group identifier' })
  @ApiOkResponse({ description: 'Array of pivot records including device details' })
  listDevices(@Param('id') groupId: string) {
    return this.groupsService.listDevices(groupId);
  }
}
