/**
 * Project entity — maps to the `projects` database table.
 */
export interface IProject {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Payload for creating a new project.
 */
export interface ICreateProjectRequest {
  readonly name: string;
  readonly description?: string;
}

/**
 * Payload for updating an existing project.
 */
export interface IUpdateProjectRequest {
  readonly name?: string;
  readonly description?: string | null;
  readonly isActive?: boolean;
}
