import { useMutation } from '@tanstack/react-query';
import * as aiApi from '@/lib/api/ai';

export function useAiChat() {
  return useMutation({ mutationFn: aiApi.sendChatMessage });
}
