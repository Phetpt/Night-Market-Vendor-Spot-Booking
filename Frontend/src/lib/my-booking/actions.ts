"use server"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { authOptions } from "@/lib/auth"
import {
  deleteBooking,
  getBookedSpotIds,
  updateBooking as updateBookingRequest,
} from "@/lib/api/bookings"
import { updateSpot } from "@/lib/api/spots"
import { statusOf } from "@/lib/api/errors"
import { spotMessage } from "@/lib/admin-spots/messages"
import { buildSpotSize, parseSpotSize } from "@/lib/spots/format"
import { validateDimension, validateFee } from "@/lib/spots/validation"
import { cancelMessage, updateMessage, type ActionResult } from "@/lib/my-booking/messages"

const OBJECT_ID = /^[a-fA-F0-9]{24}$/
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

const isObjectId = (v: unknown): v is string => typeof v === "string" && OBJECT_ID.test(v)
const isDateString = (v: unknown): v is string => typeof v === "string" && DATE_ONLY.test(v)

// หน้าที่อนุญาตให้ redirect กลับมา (กัน open redirect)
const DEFAULT_RETURN = "/my-booking"
const ALLOWED_RETURN = new Set([DEFAULT_RETURN, "/admin/bookings"])
const safeReturn = (path?: string) =>
  path && ALLOWED_RETURN.has(path) ? path : DEFAULT_RETURN

function revalidateBookingPages(...extra: string[]) {
  for (const path of ["/my-booking", "/spots", "/admin/bookings", ...extra]) {
    revalidatePath(path)
  }
}

export async function cancelBooking(
  bookingId: string,
  returnTo?: string,
): Promise<ActionResult> {
  const back = safeReturn(returnTo)
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/login?callbackUrl=${back}`)

  if (!isObjectId(bookingId)) {
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

  if (status === 401) redirect(`/session-expired?callbackUrl=${back}`)

  // 404 = ถูกยกเลิกไปแล้ว ถือว่าสำเร็จ
  if (failed && status !== 404) {
    return { ok: false, message: cancelMessage(status) }
  }

  revalidateBookingPages()
  return { ok: true }
}

type UpdateInput = {
  bookingId: string
  spotId: string
  bookingDate: string
  productType: string
  returnTo?: string
}

export async function updateBooking(input: UpdateInput): Promise<ActionResult> {
  const back = safeReturn(input.returnTo)
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/login?callbackUrl=${back}`)

  const { bookingId, spotId, bookingDate } = input
  const productType = typeof input.productType === "string" ? input.productType.trim() : ""
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })

  const valid =
    isObjectId(bookingId) &&
    isObjectId(spotId) &&
    isDateString(bookingDate) &&
    bookingDate >= today &&
    productType.length > 0 &&
    productType.length <= 100

  if (!valid) return { ok: false, message: updateMessage(400) }

  let failed = false
  let status: number | undefined

  try {
    await updateBookingRequest(
      bookingId,
      { spot: spotId, bookingDate, productType },
      session.accessToken
    )
  } catch (err) {
    failed = true
    status = statusOf(err)
  }

  if (status === 401) redirect(`/session-expired?callbackUrl=${back}`)

  if (failed) return { ok: false, message: updateMessage(status) }

  revalidateBookingPages()
  return { ok: true }
}

// spot id ที่ถูกจองแล้วในวันนั้น (ใช้กรอง dropdown) คืน null ถ้าโหลดไม่ได้
export async function getBookedSpots(date: string): Promise<string[] | null> {
  if (!isDateString(date)) return null
  try {
    return await getBookedSpotIds(date)
  } catch {
    return null
  }
}

type AdminUpdateInput = UpdateInput & {
  // ส่งมาเฉพาะตอนที่ admin แก้ขนาดหรือค่าเช่าของ spot
  spotChanges?: { spotSize: string; rentalFee: number }
}

export async function adminUpdateBooking(input: AdminUpdateInput): Promise<ActionResult> {
  const back = safeReturn(input.returnTo)
  const session = await getServerSession(authOptions)
  if (!session) redirect(`/login?callbackUrl=${back}`)
  if (session.user.role !== "admin") return { ok: false, message: updateMessage(403) }

  const { spotChanges, ...bookingInput } = input

  let spotSize = ""
  if (spotChanges) {
    const dims = typeof spotChanges.spotSize === "string" ? parseSpotSize(spotChanges.spotSize) : null
    const fee = spotChanges.rentalFee
    if ( !dims || validateDimension(String(dims.width), "Width") !== null 
    || validateDimension(String(dims.depth), "Depth") !== null 
    || typeof fee !== "number" 
    || validateFee(String(fee)) !== null ) {
      return { ok: false, message: spotMessage(400) }
    }
    spotSize = buildSpotSize(dims.width, dims.depth)
  }

  const result = await updateBooking(bookingInput)
  if (!result.ok || !spotChanges) return result

  let failed = false
  let status: number | undefined

  try {
    await updateSpot(
      input.spotId,
      { spotSize, rentalFee: spotChanges.rentalFee },
      session.accessToken,
    )
  } catch (err) {
    failed = true
    status = statusOf(err)
  }

  if (status === 401) redirect(`/session-expired?callbackUrl=${back}`)
  if (failed) {
    return {
      ok: false,
      message: `Booking was saved, but the spot details were not. ${spotMessage(status)}`,
    }
  }

  revalidateBookingPages("/admin/spots")
  return { ok: true }
}
