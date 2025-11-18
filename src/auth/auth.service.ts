import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    if (!email) throw new BadRequestException('Email is required');
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('User not found');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(user: { id: string; username: string; email: string; role: Role }) {
    const payload = { sub: user.id, username: user.username, email: user.email, role: user.role };
    return {
      access_token: this.jwt.sign(payload),
      user,
    };
  }

  async register(data: { username: string; email: string; password: string; role?: Role }) {
    const hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hash,
        role: data.role || Role.OPERATOR,
      },
    });
  }
}
