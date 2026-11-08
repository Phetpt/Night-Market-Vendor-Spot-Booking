import { env } from "../env";
import type { ApiError, ApiFailure, ApiSuccess } from "@/types/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
  token?: string
}

export default async function apiRequest<T>(path: string, options: RequestOptions= {}): Promise<ApiSuccess<T>> {

  const {method = "GET", body, token} = options

  const res = await fetch(`${env.API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body !== undefined ? JSON.stringify(body): undefined
  })

  const json = (await res.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null

  if(!json || !res.ok || !json.success) {
    const message = json && !json.success ? json.error : `Request to ${path} failed (${res.status})`
    throw {status: res.status, message} satisfies ApiError
  }
  return json
}