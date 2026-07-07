import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { Role, User } from '@sisenco/shared-types';
import { Roles } from '../common/decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Roles(Role.MANAGER)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, dto);
  }
}
