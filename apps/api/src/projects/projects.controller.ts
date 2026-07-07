import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Project, Role } from '@sisenco/shared-types';
import { Roles } from '../common/decorators';
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
}
