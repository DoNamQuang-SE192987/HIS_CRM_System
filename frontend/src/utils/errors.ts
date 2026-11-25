import { ApiError } from "@/services/api-client";

/** Human message for any thrown value. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

/** Field errors of a 400 VALIDATION_ERROR, or an empty object. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  return error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {};
}
