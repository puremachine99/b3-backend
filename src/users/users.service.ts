import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    const hash = await bcrypt.hash(data.password, 10);

    // Prevent duplicate email/username before hitting DB unique constraint
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already exists');
    }

    try {
      return await this.prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          password: hash,
          role: data.role || Role.OPERATOR,
        },
      });
    } catch (err: any) {
      // Prisma P2002 = unique constraint
      if (err?.code === 'P2002' && Array.isArray(err?.meta?.target)) {
        throw new ConflictException(
          `User already exists with ${err.meta.target.join(', ')}`,
        );
      }
      throw err;
    }
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateUserDto) {
    const newData: any = { ...data };
    if (newData.password) newData.password = await bcrypt.hash(newData.password, 10);

    // Prevent duplicate email/username for other records
    if (data.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: data.email, NOT: { id } },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }
    if (data.username) {
      const existingUsername = await this.prisma.user.findFirst({
        where: { username: data.username, NOT: { id } },
      });
      if (existingUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    return this.prisma.user.update({ where: { id }, data: newData });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
