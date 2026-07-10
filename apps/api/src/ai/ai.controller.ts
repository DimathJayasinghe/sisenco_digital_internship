import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ChatResponse, Role } from '@sisenco/shared-types';
import { Roles } from '../common/decorators';
import { AiService } from './ai.service';
import { ChatMessageDto } from './dto/chat-message.dto';

// Tighter than the global rate limit — this hits a paid external API per request.
const AI_CHAT_THROTTLE = { default: { limit: 20, ttl: 60_000 } };

@Roles(Role.MANAGER)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Throttle(AI_CHAT_THROTTLE)
  @Post('chat')
  chat(@Body() dto: ChatMessageDto): Promise<ChatResponse> {
    return this.aiService.chat(dto.message);
  }
}
