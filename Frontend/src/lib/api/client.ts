import { env } from "../env"
import type { ApiError, ApiFailure, ApiSuccess } from "@/types/api"

// ตัวเลือกที่ผู้เรียกกำหนดได้ (ไม่ใส่สักตัวก็ได้)
type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" // ค่าเริ่มต้นคือ GET
  body?: unknown // ข้อมูลที่จะส่งไป (จะถูกแปลงเป็น JSON ให้เอง)
  token?: string // JWT สำหรับ endpoint ที่ต้อง login
}

// ฟังก์ชันกลางสำหรับเรียก Backend ทุก endpoint
// T = ชนิดของ data ที่คาดว่าจะได้กลับมา เช่น apiRequest<User>("/auth/me", { token })
// สำเร็จ → คืน { success: true, data }, ล้มเหลว → throw { status, message }
export default async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiSuccess<T>> {
  // ---------- Options ----------
  const { method = "GET", body, token } = options

  // ---------- Request ----------
  const res = await fetch(`${env.API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      // แนบ token เฉพาะตอนมี ไม่งั้นจะส่ง "Bearer undefined"
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    // GET ไม่มี body จึงส่ง undefined
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // ---------- Response ----------
  // ถ้าคำตอบไม่ใช่ JSON (เช่น Backend ล่ม) ให้เป็น null แทนที่จะ crash
  const json = (await res.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null

  // ---------- Error handling ----------
  // ล้มเหลวถ้า: ไม่ได้ JSON / status ไม่ใช่ 2xx / Backend ตอบ success: false
  if (!json || !res.ok || !json.success) {
    // ใช้ข้อความ error จาก Backend ก่อน ถ้าไม่มีค่อยใช้ข้อความสำรอง
    const message = json && !json.success ? json.error : `Request to ${path} failed (${res.status})`
    throw { status: res.status, message } satisfies ApiError
  }

  return json
}
