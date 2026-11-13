"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { authOptions } from "@/lib/auth"
import { createBooking } from "@/lib/api/bookings"
import type { ApiError } from "@/types/api"
import { MAX_PER_DAY } from "@/config/booking"

export type BookingItem = { spotId: string; productType: string }
export type BookingResult = { spotId: string; ok: boolean; error?: string }

export async function bookSpots(date: string, items: BookingItem[]): Promise<BookingResult[]> {
  const session = await getServerSession(authOptions)
  if (!session) {
    return items.map((item) => ({ spotId: item.spotId, ok: false, error: "Please log in first" }))
  }
  if (items.length === 0 || items.length > MAX_PER_DAY) {
  return items.map((item) => ({ spotId: item.spotId, ok: false, error: "Invalid request" }))
}

  const results: BookingResult[] = []

  // แปลง error จาก backend เป็นข้อความที่ผู้ใช้อ่านรู้เรื่อง
  function messageFor(err: Partial<ApiError>): string {
    switch (err.status) {
      case 400:
      case 409:
        // กฎของระบบ เช่น ช่องถูกจองแล้ว / เกิน 3 ช่องต่อวัน ข้อความจาก backend ใช้ได้
        return err.message ?? "This spot can't be booked"
      case 401:
        return "Your session has expired, please log in again"
      case 403:
        return "Only member accounts can book spots"
      case 429:
        return "Too many requests, please try again in a few minutes"
      case undefined:
        return "Can't reach the server, please try again"
      default:
        return "Something went wrong, please try again"
    }
  }

  for (const item of items) {
    try {
      await createBooking(
        { spot: item.spotId, bookingDate: date, productType: item.productType.trim() },
        session.accessToken
      )
      results.push({ spotId: item.spotId, ok: true })
    } catch (error) {
      const err = error as Partial<ApiError>
      results.push({ spotId: item.spotId, ok: false, error: messageFor(err) })
    }
  }

  revalidatePath("/spots")
  return results
}