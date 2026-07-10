import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

/**
 * AiModule (bonus) — Gemini-backed chat assistant that answers a manager's
 * questions using the current/recent week's submitted report data as context.
 */
@Module({
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
