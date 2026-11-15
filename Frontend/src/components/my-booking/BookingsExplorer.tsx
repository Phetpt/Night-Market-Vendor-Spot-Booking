"use client"

import { useState } from "react"

import type { Booking } from "@/types/booking"
import BookingCard from "@/components/my-booking/BookingCard"
import BookingHistory from "@/components/my-booking/BookingHistory"
import EmptyState from "@/components/my-booking/EmptyState"

type Filter = "all" | "active" | "completed"

type Props = {
  upcoming: Booking[]
  past: Booking[]
  today: string
  nightCounts: Record<string, number>
}

export default function BookingsExplorer({ upcoming, past, today, nightCounts }: Props) {
  const [filter, setFilter] = useState<Filter>("all")

  const chips: { id: Filter; label: string }[] = [
    { id: "all", label: "All Bookings" },
    { id: "active", label: `Active (${upcoming.length})` },
    { id: "completed", label: `Completed (${past.length})` },
  ]

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
            className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
              filter === c.id
                ? "border-[#1B2038] bg-[#1B2038] text-white"
                : "border-[#DDE3F2] bg-white text-[#1B2038] hover:bg-[#FFF4EC]"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filter !== "completed" && (
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
                <BookingCard
                  key={b._id}
                  booking={b}
                  usedOnNight={nightCounts[b.bookingDate.slice(0, 10)] ?? 1}
                  today={today}
                  nightCounts={nightCounts}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {filter !== "active" && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-[#1F2A44]">Booking History</h2>
            <span className="text-sm text-[#4A5470]">{past.length} total</span>
          </div>
          <BookingHistory bookings={past} />
        </section>
      )}
    </>
  )
}