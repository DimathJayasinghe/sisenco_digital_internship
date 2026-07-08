import { Prisma, Project as PrismaProject } from '@prisma/client';
import { Project, ProjectMember } from '@sisenco/shared-types';

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

type ProjectMemberWithUser = Prisma.UserProjectGetPayload<{ include: { user: true } }>;

/** Maps a Prisma user_projects row (with `user` relation loaded) to the API-safe shape. */
export function toProjectMemberDto(member: ProjectMemberWithUser): ProjectMember {
  return {
    projectId: member.projectId,
    userId: member.userId,
    assignedAt: member.assignedAt.toISOString(),
    user: {
      id: member.user.id,
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
    },
  };
}
