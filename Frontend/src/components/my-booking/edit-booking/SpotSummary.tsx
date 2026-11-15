import { Ruler } from "lucide-react"

import type { BookingSpot } from "@/types/booking"
import { Tile } from "./booking-ui"

export default function SpotSummary({ spot }: { spot: BookingSpot }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Tile title="Spot number">
        <p className="text-2xl font-bold text-[#8A3F1D]">{spot.spotNumber}</p>
      </Tile>
      <Tile title="Market zone">
        <p className="font-semibold">{spot.zone}</p>
      </Tile>
      <Tile title="Physical footprint">
        <p className="flex items-center gap-1.5 font-semibold">
          <Ruler className="size-4 text-[#4A5470]" />
          {spot.spotSize}
        </p>
      </Tile>
      <Tile title="Rental fee">
        <p className="text-2xl font-bold text-[#A33900]">
          ฿{spot.rentalFee.toLocaleString("en-US")}
          <span className="ml-1 text-xs font-semibold text-[#4A5470]">/ night</span>
        </p>
      </Tile>
    </div>
  )
}
