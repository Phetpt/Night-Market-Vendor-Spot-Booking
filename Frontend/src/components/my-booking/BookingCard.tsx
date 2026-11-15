import type { Booking } from "@/types/booking"
import CancelBookingButton from "./CancelBookingButton"

import { formatDate, formatShortDate } from "@/lib/my-booking/format"
import { DAILY_LIMIT } from "@/lib/my-booking/summary"
import EditBookingButton from "@/components/my-booking/edit-booking/EditBookingButton"

type Props = {
  booking: Booking
  usedOnNight: number
  today: string
  nightCounts: Record<string, number>
}

export default function BookingCard({ booking, usedOnNight, today, nightCounts }: Props) {
  const { spot } = booking
  const ref = `#${booking._id.slice(-8).toUpperCase()}`
  const dateLabel = formatDate(booking.bookingDate.slice(0, 10))

  return (
    <article className="overflow-hidden rounded-2xl border border-[#DDE3F2] bg-white">
      <div className="h-1.5 bg-emerald-400" />

      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center">
   
        <div className="flex h-[108px] w-full shrink-0 flex-col items-center justify-center rounded-xl border border-[#DDE3F2] bg-[#FFF4EC] md:w-[124px]">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#4A5470]">
            Spot ID
          </span>
          <span className="text-3xl font-bold text-[#8A3F1D]">{spot.spotNumber}</span>
          <span className="text-xs font-semibold text-[#4A5470]">{spot.spotSize}</span>
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
              Confirmed
            </span>
            <span className="rounded-full border border-[#DDE3F2] bg-white px-2.5 py-0.5 text-xs font-semibold text-[#1B2038]">
              {spot.zone}
            </span>
            {!spot.isActive && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                Spot unavailable
              </span>
            )}
          </div>

          <p className="text-sm text-[#4A5470]">
            Booking Ref <span className="font-semibold text-[#1B2038]">{ref}</span>
          </p>

          <p className="text-lg font-bold text-[#1F2A44]">{dateLabel}</p>

          <p className="text-sm text-[#4A5470]">
            Product Category:{" "}
            <span className="font-semibold text-[#1B2038]">{booking.productType}</span>
          </p>
        </div>

        {/* Fee + actions */}
        <div className="flex flex-col gap-3 md:items-end">
          <p className="text-xl font-bold text-[#A33900]">
            ฿{spot.rentalFee.toLocaleString("en-US")}
            <span className="ml-1 text-sm font-semibold text-[#4A5470]">/ night</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <EditBookingButton
              booking={booking}
              today={today}
              nightCounts={nightCounts}
              dailyLimit={DAILY_LIMIT}
            />

            <CancelBookingButton
              bookingId={booking._id}
              spotNumber={spot.spotNumber}
              zone={spot.zone}
              productType={booking.productType}
              bookingRef={ref}
              fee={spot.rentalFee}
              dateLabel={dateLabel}
              shortDate={formatShortDate(booking.bookingDate.slice(0, 10))}
              usedOnNight={usedOnNight}
              dailyLimit={DAILY_LIMIT}
            />

          </div>
        </div>
      </div>
    </article>
  )
}