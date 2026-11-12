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

  for (const item of items) {
    try {
      await createBooking(
        { spot: item.spotId, bookingDate: date, productType: item.productType.trim() },
        session.accessToken
      )
      results.push({ spotId: item.spotId, ok: true })
    } catch (error) {
      const err = error as Partial<ApiError>
      const message = err.status === 400 || err.status === 409 ? err.message : "Something went wrong"
      results.push({ spotId: item.spotId, ok: false, error: message })
    }
  }

  revalidatePath("/spots")
  return results
}