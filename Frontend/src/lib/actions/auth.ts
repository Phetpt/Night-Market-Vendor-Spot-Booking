"use server"

import { register } from "@/lib/api/auth"
import { validateRegister } from "@/lib/validation/auth"
import type { ApiError } from "@/types/api"

// ผลลัพธ์ที่คืนให้ฟอร์ม: ไม่ throw เพราะ production จะซ่อนข้อความ error
export type ActionResult =
  | { ok: true }
  | { ok: false; errors?: Record<string, string | undefined>; message?: string }

function toMessage(err: unknown) {
  const e = err as Partial<ApiError>
  if (e?.status === 409 || /E11000|duplicate key/i.test(e?.message ?? ""))
    return "Email already in use"
  if (e?.status && e.status >= 500) return "Something went wrong. Please try again."
  return e?.message ?? "Something went wrong"
}

export async function registerAction(values: unknown): Promise<ActionResult> {
  const result = validateRegister(values as never)
  if (!result.ok) return { ok: false, errors: result.errors }

  try {
    await register(result.data)
  } catch (err) {
    return { ok: false, message: toMessage(err) }
  }

  return { ok: true }
}
