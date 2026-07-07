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
