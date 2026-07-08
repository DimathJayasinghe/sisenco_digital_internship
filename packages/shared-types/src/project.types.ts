import { UserSummary } from './user.types';

/**
 * A work category/tag attached to reports. Soft-deleted via `isActive`.
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * A member assignment on a project (`user_projects`) — optionally restricts
 * which projects a member can report on. See DATABASE.md §3.
 */
export interface ProjectMember {
  projectId: string;
  userId: string;
  assignedAt: string;
  user: UserSummary;
}
