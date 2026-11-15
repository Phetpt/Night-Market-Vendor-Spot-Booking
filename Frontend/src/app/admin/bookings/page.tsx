import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { listBookings } from "@/lib/api/bookings"
import { statusOf } from "@/lib/api/errors"
import type { Booking } from "@/types/booking"
import AdminBookingsExplorer from "@/components/admin/bookings/AdminBookingsExplorer"

export const metadata: Metadata = {
  title: "Upcoming bookings · Night Market Vendor Spot",
}

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login?callbackUrl=/admin/bookings")

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })

  let bookings: Booking[] | null = null
  let status: number | undefined

  try {
    // admin token ได้ booking ของทุกคน (ไม่กรองด้วย user._id เหมือนหน้า my-booking)
    const all = await listBookings(session.accessToken)
    // แสดงเฉพาะคืนที่ยังไม่ผ่าน (วันนี้เป็นต้นไป)
    bookings = all.bookings.filter((b) => b.bookingDate.slice(0, 10) >= today)
  } catch (err) {
    status = statusOf(err)
  }

  if (status === 401) redirect("/session-expired?callbackUrl=/admin/bookings")

  if (bookings === null) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load bookings. Please try again.
        </div>
      </div>
    )
  }

  return <AdminBookingsExplorer bookings={bookings} today={today} />
}
