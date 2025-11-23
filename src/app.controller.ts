import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Simple health check endpoint' })
  @ApiOkResponse({ description: 'Returns hello string' })
  getHello(): string {
    return this.appService.getHello();
  }
}
