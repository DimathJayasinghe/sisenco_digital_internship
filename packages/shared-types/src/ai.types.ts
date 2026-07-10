/** A single message sent to the AI chat assistant (POST /ai/chat). */
export interface ChatRequest {
  message: string;
}

/** The assistant's reply, over the current/recent week's report context. */
export interface ChatResponse {
  reply: string;
}
