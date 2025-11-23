import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { UpdateDatabaseDto } from './dto/update-database.dto';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Database')
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create database record (scaffold example)' })
  @ApiBody({ type: CreateDatabaseDto })
  @ApiOkResponse({ description: 'Created record' })
  create(@Body() createDatabaseDto: CreateDatabaseDto) {
    return this.databaseService.create(createDatabaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'List database records' })
  @ApiOkResponse({ description: 'Array of records' })
  findAll() {
    return this.databaseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a record by ID' })
  @ApiParam({ name: 'id', description: 'Record identifier' })
  @ApiOkResponse({ description: 'Record payload' })
  findOne(@Param('id') id: string) {
    return this.databaseService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a record by ID' })
  @ApiParam({ name: 'id', description: 'Record identifier' })
  @ApiBody({ type: UpdateDatabaseDto })
  @ApiOkResponse({ description: 'Updated record payload' })
  update(@Param('id') id: string, @Body() updateDatabaseDto: UpdateDatabaseDto) {
    return this.databaseService.update(+id, updateDatabaseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a record by ID' })
  @ApiParam({ name: 'id', description: 'Record identifier' })
  @ApiOkResponse({ description: 'Deletion acknowledgement' })
  remove(@Param('id') id: string) {
    return this.databaseService.remove(+id);
  }
}
