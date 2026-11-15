import type { Booking } from "@/types/booking"
import { formatDate } from "@/lib/my-booking/format"
import EmptyState from "./EmptyState"

export default function BookingHistory({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No past bookings yet"
        description="Bookings from earlier nights will appear here."
      />
    )
  }

  const th = "px-4 py-3"
  const td = "px-4 py-3"

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#DDE3F2] bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-[#DDE3F2] bg-[#EFF4FF] text-xs font-bold uppercase tracking-wide text-[#4A5470]">
          <tr>
            <th className={th}>Date</th>
            <th className={th}>Spot</th>
            <th className={th}>Product</th>
            <th className={th}>Fee</th>
            <th className={th}>Ref</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id} className="border-b border-[#DDE3F2] last:border-b-0">
              <td className={`${td} font-semibold text-[#1B2038]`}>
                {formatDate(b.bookingDate.slice(0, 10))}
              </td>
              <td className={`${td} text-[#1B2038]`}>
                {b.spot.spotNumber}
                <span className="ml-1 text-[#4A5470]">· {b.spot.zone}</span>
              </td>
              <td className={`${td} text-[#4A5470]`}>{b.productType}</td>
              <td className={`${td} font-semibold text-[#A33900]`}>
                ฿{b.spot.rentalFee.toLocaleString("en-US")}
              </td>
              <td className={`${td} text-[#4A5470]`}>
                #{b._id.slice(-8).toUpperCase()}
              </td>
              <td className={td}>
                <span className="rounded-full border border-[#DDE3F2] bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#4A5470]">
                  Completed
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}