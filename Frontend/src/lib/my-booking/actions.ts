"use server"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { authOptions } from "@/lib/auth"
import { deleteBooking, updateBooking as updateBookingRequest } from "@/lib/api/bookings"
import { statusOf } from "@/lib/api/errors"
import { cancelMessage, updateMessage, type ActionResult } from "@/lib/my-booking/messages"

const OBJECT_ID = /^[a-fA-F0-9]{24}$/

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login?callbackUrl=/my-booking")

  if (!OBJECT_ID.test(bookingId)) {
    return { ok: false, message: cancelMessage(400) }
  }

  let failed = false
  let status: number | undefined

  try {
    await deleteBooking(bookingId, session.accessToken)
  } catch (err) {
    failed = true
    status = statusOf(err)
  }

  // 404 = ถูกยกเลิกไปแล้ว ถือว่าสำเร็จ
  if (failed && status !== 404) {
    return { ok: false, message: cancelMessage(status) }
  }

  revalidatePath("/my-booking")
  revalidatePath("/spots")
  return { ok: true }
}

type UpdateInput = {
  bookingId: string
  spotId: string
  bookingDate: string
  productType: string
}

export async function updateBooking(input: UpdateInput): Promise<ActionResult> {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login?callbackUrl=/my-booking")

  const { bookingId, spotId, bookingDate } = input
  const productType = typeof input.productType === "string" ? input.productType.trim() : ""
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })

  const valid =
    typeof bookingId === "string" && OBJECT_ID.test(bookingId) &&
    typeof spotId === "string" && OBJECT_ID.test(spotId) &&
    typeof bookingDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(bookingDate) &&
    bookingDate >= today &&
    productType.length > 0 && productType.length <= 100

  if (!valid) return { ok: false, message: updateMessage(400) }

  let failed = false
  let status: number | undefined

  try {
    // ลำดับ argument ต้องตรงกับที่ประกาศใน lib/api/bookings.ts
    await updateBookingRequest(
      bookingId,
      { spot: spotId, bookingDate, productType },
      session.accessToken
    )
  } catch (err) {
    failed = true
    status = statusOf(err)
  }

  if (failed) return { ok: false, message: updateMessage(status) }

  revalidatePath("/my-booking")
  revalidatePath("/spots")
  return { ok: true }
}