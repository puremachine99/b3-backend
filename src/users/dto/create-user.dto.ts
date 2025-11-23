import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Name displayed to the rest of the team', example: 'Admin Pusat' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Unique login email', example: 'admin@b3sahabat.id' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the created user', example: 'Sup3rStr0ng!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Role to assign, default OPERATOR', enum: Role, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
