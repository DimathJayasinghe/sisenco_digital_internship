import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Project, ProjectMember, Role } from '@sisenco/shared-types';
import { Roles } from '../common/decorators';
import { AssignMemberDto } from './dto/assign-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAllActive(): Promise<Project[]> {
    return this.projectsService.findAllActive();
  }

  @Roles(Role.MANAGER)
  @Post()
  create(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.projectsService.create(dto);
  }

  @Roles(Role.MANAGER)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectDto): Promise<Project> {
    return this.projectsService.update(id, dto);
  }

  @Roles(Role.MANAGER)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<Project> {
    return this.projectsService.softDelete(id);
  }

  @Roles(Role.MANAGER)
  @Post(':id/members')
  assignMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignMemberDto,
  ): Promise<ProjectMember> {
    return this.projectsService.assignMember(id, dto);
  }

  @Roles(Role.MANAGER)
  @HttpCode(HttpStatus.OK)
  @Delete(':id/members/:userId')
  async unassignMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<{ success: true }> {
    await this.projectsService.unassignMember(id, userId);
    return { success: true };
  }
}
