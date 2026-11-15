import type { ApiError } from "@/types/api";

export function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e
}

export function statusOf(e: unknown): number | undefined {
  return isApiError(e) ? e.status : undefined
}