import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

/**
 * ProjectsModule — project/category CRUD (soft-delete via is_active).
 * Member assignment (user_projects) is deferred — see PROGRESS.md.
 */
@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
