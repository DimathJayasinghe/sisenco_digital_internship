import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { AuthUser, Role, User } from '@sisenco/shared-types';
import { CurrentUser, Roles } from '../common/decorators';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.MANAGER)
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Declared before the `:id` route below — Nest/Express match routes in
  // registration order, and `:id` would otherwise swallow the literal `me`
  // segment. Open to any authenticated role (no @Roles here).
  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: AuthUser['id'],
    @Body() dto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(userId, dto);
  }

  @Roles(Role.MANAGER)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Roles(Role.MANAGER)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, dto);
  }
}
