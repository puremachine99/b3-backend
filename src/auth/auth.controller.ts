import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Generate JWT token for a valid user' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'JWT access token and payload returned on success' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new platform user' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'Newly created user data with generated ID' })
  async register(@Body() body: RegisterDto) {
    const roleEnum = body.role && Object.values(Role).includes(body.role as Role) ? body.role : Role.OPERATOR;
    return this.authService.register({
      username: body.username,
      email: body.email,
      password: body.password,
      role: roleEnum,
    });
  }
}
