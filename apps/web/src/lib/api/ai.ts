import type { ApiResponse, ChatRequest, ChatResponse } from '@sisenco/shared-types';
import { api } from './client';

export async function sendChatMessage(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await api.post<ApiResponse<ChatResponse>>('/ai/chat', payload);
  return data.data;
}
