"use server"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { authOptions } from "@/lib/auth"
import { deleteBooking } from "@/lib/api/bookings"
import { statusOf } from "@/lib/api/errors"
import { cancelMessage, type ActionResult } from "@/lib/my-booking/messages"

export async function cancelBooking(bookingId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login?callbackUrl=/my-booking")

  if (!/^[a-fA-F0-9]{24}$/.test(bookingId)) {
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

  if (status === 401) redirect("/login?callbackUrl=/my-booking")

  // 404 = ถูกยกเลิกไปแล้ว ถือว่าสำเร็จ
  if (failed && status !== 404) {
    return { ok: false, message: cancelMessage(status) }
  }

  revalidatePath("/my-booking")
  revalidatePath("/spots")
  return { ok: true }
}