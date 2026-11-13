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

  if (e?.status === 409 || /E11000|duplicate key/i.test(e?.message ?? "")) {
    return "Email already in use"
  }
  if (e?.status === 429) {
    return "Too many attempts, please try again in a few minutes"
  }
  if (e?.status === 400) {
    // ข้อมูลไม่ผ่านกฎของ backend ข้อความจาก backend ใช้ได้
    return e.message ?? "Please check your details and try again"
  }
  if (e?.status === undefined) {
    // ไม่มี status = ไม่ได้คุยกับ backend สำเร็จ
    return "Can't reach the server, please try again"
  }
  return "Something went wrong. Please try again."
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
