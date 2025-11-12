import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: { username: string; password: string; role?: string }) {
    const roleEnum =
      body.role && Object.values(Role).includes(body.role as Role)
        ? (body.role as Role)
        : Role.OPERATOR;

    return this.authService.register({
      username: body.username,
      password: body.password,
      role: roleEnum,
    });
  }
}
