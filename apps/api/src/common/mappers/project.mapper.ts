import { Project as PrismaProject } from '@prisma/client';
import { Project } from '@sisenco/shared-types';

/** Maps a Prisma project row to the API-safe shape (dates as ISO strings). */
export function toProjectDto(project: PrismaProject): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    isActive: project.isActive,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
