import { AxiosError } from 'axios';
import type { ApiError } from '@sisenco/shared-types';

const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

/** Extracts a user-facing message from the standard { statusCode, error, message } envelope. */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiError | undefined;
    if (body?.message) {
      return Array.isArray(body.message) ? body.message.join(' ') : body.message;
    }
  }
  return GENERIC_MESSAGE;
}
