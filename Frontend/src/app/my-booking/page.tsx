import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { listBookings } from "@/lib/api/bookings"
import { statusOf } from "@/lib/api/errors"
import type { Booking } from "@/types/booking"
import { splitBookings, summarize, DAILY_LIMIT } from "@/lib/my-booking/summary"
import { formatDate, daysUntil, relativeLabel } from "@/lib/my-booking/format"
import SummaryCards from "@/components/my-booking/SummaryCards"
import BookingsExplorer from "@/components/my-booking/BookingsExplorer"

export default async function MyBookingPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login?callbackUrl=/my-booking")

  let bookings: Booking[] | null = null
  let status: number | undefined

  try {
    const all = await listBookings(session.accessToken)
    bookings = all.bookings.filter((b) => b.user._id === session.user.id)
  } catch (err) {
    status = statusOf(err)
  }

  if (status === 401) redirect("/session-expired?callbackUrl=/my-booking")

  if (bookings === null) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Couldn&apos;t load your bookings. Please try again.
        </div>
      </div>
    )
  }

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })
  const { upcoming, past } = splitBookings(bookings, today)
  const summary = summarize(upcoming)

// นับจำนวน booking ในแต่ละคืน ไว้บอกโควต้าในกล่องยกเลิก
  const perNight = new Map<string, number>()
  for (const b of upcoming) {
    const d = b.bookingDate.slice(0, 10)
    perNight.set(d, (perNight.get(d) ?? 0) + 1)
  }
  const nightCounts = Object.fromEntries(perNight)

  return (
    <div className="space-y-6 px-6 py-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="inline-block rounded-full bg-[#FBE3D6] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#8A3F1D]">
            Member Reservations
          </span>
          <h1 className="text-3xl font-bold text-[#1F2A44]">My Bookings</h1>
          <p className="text-[#4A5470]">
            Manage your upcoming night market spots and review past bookings.
          </p>
        </div>

        <Link
          href="/spots"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#8A3F1D] px-4 font-bold text-white hover:bg-[#6F3217] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
        >
          <Plus className="size-4" />
          Book Another Spot
        </Link>
      </header>

      <SummaryCards
        usedOnNextNight={summary.usedOnNextNight}
        dailyLimit={DAILY_LIMIT}
        nextDateLabel={summary.nextDate ? formatDate(summary.nextDate) : "—"}
        count={summary.count}
        nextSpotNumber={summary.next?.spot.spotNumber ?? "—"}
        relative={summary.nextDate ? relativeLabel(daysUntil(summary.nextDate, today)) : ""}
        totalFees={summary.totalFees}
      />

      <BookingsExplorer
        upcoming={upcoming}
        past={past}
        today={today}
        nightCounts={nightCounts}
      />
    </div>
  )
}
