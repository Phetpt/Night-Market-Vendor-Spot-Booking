export type ApiSuccess<T> = { success: true; count?: number; data: T }
export type ApiFailure = { success: false; error: string }
export type ApiError = { status: number; message: string }
