import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Name that will be shown to other users', example: 'Operator Kebun A' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Unique email that will be used to login', example: 'operator@b3sahabat.id' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password with minimum 6 characters', example: 'Sup3rStr0ng!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Role assigned to the user, defaults to OPERATOR when omitted',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
