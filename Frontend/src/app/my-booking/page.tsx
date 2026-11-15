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
import BookingCard from "@/components/my-booking/BookingCard"

import EmptyState from "@/components/my-booking/EmptyState"
import BookingHistory from "@/components/my-booking/BookingHistory"

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

  if (status === 401) redirect("/login?callbackUrl=/my-booking")

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

            <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-[#1F2A44]">Active &amp; Upcoming Bookings</h2>
          <span className="text-sm text-[#4A5470]">{upcoming.length} total</span>
        </div>

        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming bookings"
            description="Pick a night and reserve a spot for your stall."
            action={{ href: "/spots", label: "Book a Spot" }}
          />
        ) : (
          <div className="space-y-4">
            {upcoming.map((b) => (
              <BookingCard key={b._id} booking={b} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-[#1F2A44]">Booking History</h2>
          <span className="text-sm text-[#4A5470]">{past.length} total</span>
        </div>
        <BookingHistory bookings={past} />
      </section>
    </div>
  )
}
