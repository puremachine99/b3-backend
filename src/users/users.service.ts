import { Injectable } from '@nestjs/common';
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
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hash,
        role: data.role || Role.OPERATOR,
      },
    });
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

    return this.prisma.user.update({ where: { id }, data: newData });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
