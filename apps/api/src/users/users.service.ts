import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User } from '@sisenco/shared-types';
import { toSafeUser } from '../common/mappers';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'asc' },
    });
    return users.map(toSafeUser);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return toSafeUser(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const data: Prisma.UserUpdateInput = {
      ...(dto.firstName !== undefined && { firstName: dto.firstName }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName }),
    };

    if (dto.role !== undefined) {
      const role = await this.prisma.role.findUniqueOrThrow({ where: { name: dto.role } });
      data.role = { connect: { id: role.id } };
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
    return toSafeUser(updated);
  }
}
