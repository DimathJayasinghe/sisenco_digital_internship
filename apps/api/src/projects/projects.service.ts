import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Project } from '@sisenco/shared-types';
import { toProjectDto } from '../common/mappers';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return projects.map(toProjectDto);
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    await this.assertNameAvailable(dto.name);
    const project = await this.prisma.project.create({ data: dto });
    return toProjectDto(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.findByIdOrThrow(id);
    if (dto.name !== undefined) {
      await this.assertNameAvailable(dto.name, id);
    }

    const project = await this.prisma.project.update({ where: { id }, data: dto });
    return toProjectDto(project);
  }

  /** Soft-delete only (DATABASE.md §3) — preserves report history via `is_active = false`. */
  async softDelete(id: string): Promise<Project> {
    await this.findByIdOrThrow(id);
    const project = await this.prisma.project.update({
      where: { id },
      data: { isActive: false },
    });
    return toProjectDto(project);
  }

  private async findByIdOrThrow(id: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private async assertNameAvailable(name: string, excludingId?: string): Promise<void> {
    const existing = await this.prisma.project.findUnique({ where: { name } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException('A project with this name already exists');
    }
  }
}
