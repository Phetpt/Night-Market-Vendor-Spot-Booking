import type { Spot } from "@/types/spot"
import type { BookingResult } from "@/app/actions/bookings"

type Props = {
  selectedSpots: Spot[]
  onRemove: (id: string) => void
  onConfirm: () => void
  maxSpots: number // เพดานช่องต่อวัน (ส่งมาจาก parent จะได้ไม่ซ้ำกับ MAX_PER_DAY)
  productTypes: Record<string, string>
  onProductTypeChange: (id: string, value: string) => void
  alreadyBookedCount: number
  isSubmitting: boolean
  results: (BookingResult & { label: string })[]
}


export default function SelectionPanel({ selectedSpots, onRemove, onConfirm, maxSpots, productTypes, onProductTypeChange, alreadyBookedCount, isSubmitting, results}: Props) {
  // ---------- Derived data ----------
  const hasSelection = selectedSpots.length > 0
  const total = selectedSpots.reduce((sum, spot) => sum + spot.rentalFee, 0)

  const usedCount = alreadyBookedCount + selectedSpots.length
  const limitReached = usedCount >= maxSpots

  // check: Have the product types been entered for all the selected slots?
  const allFilled = selectedSpots.every(
    (spot) => (productTypes[spot._id] ?? "").trim() !== ""
  )

  // ---------- Render ----------
  return (
    <div className="w-full rounded-3xl border border-indigo-100 bg-white px-6 py-5 flex flex-col items-start gap-2">
      {/* Header + ตัวนับจำนวนที่เลือก */}
      <h2 className="font-bold text-xl">Your selection</h2>
      {results.length > 0 && (
        <ul role="status" className="w-full space-y-1 text-sm">
          {results.map((r) => (
            <li key={r.spotId} className={r.ok ? "text-emerald-700" : "text-red-700"}>
              {r.label}: {r.ok ? "booked" : r.error}
            </li>
          ))}
        </ul>
      )}
      {usedCount > 0 && (
    <p className="text-sm text-[#4A5470]">
      {selectedSpots.length} selected + {alreadyBookedCount} already booked = {usedCount} of {maxSpots} spots
    </p>
  )}

  {limitReached && (
    <p className="w-full rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
      Daily limit reached ({usedCount} of {maxSpots}). Remove a spot to pick a different one.
    </p>
  )}

      {/* รายการที่เลือก (หรือ empty state) */}
      {!hasSelection ? (
        <p className="text-sm text-[#4A5470]">Pick a spot from the list to start.</p>
      ) : (
        <ul className="flex w-full flex-col gap-2">
          {selectedSpots.map((spot) => (
            <li
              key={spot._id}
              className="flex flex-col gap-2 rounded-xl border border-indigo-100 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{spot.spotNumber}</div>
                  <div className="text-sm text-[#4A5470]">
                    {spot.zone} · {spot.spotSize}
                  </div>
                </div>
                <div className="flex justify-between items-center gap-2.5">
                  <span className="font-bold">฿{spot.rentalFee}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(spot._id)}
                    aria-label={`Remove ${spot.spotNumber}`}
                    className="flex size-8 items-center justify-center rounded-lg border border-indigo-100 text-[#4A5470] hover:bg-slate-100"
                  >
                    X
                  </button>
                </div>
                
              </div>
             
              <div className="flex flex-col gap-1">
                <label 
                htmlFor={`product-${spot._id}`} 
                className="text-sm font-semibold">
                  Product Type
                </label>
                <input 
                type="text" 
                value={productTypes[spot._id] ?? ""}
                onChange={(e)=>onProductTypeChange(spot._id, e.target.value)}
                id={`product-${spot._id}`} 
                placeholder="e.g. Grilled pork skewers"
                className="h-10 w-full rounded-lg border border-[#CFD8EE] px-3 text-sm"/>
              </div>
            </li>
            
          ))}
        </ul>
      )}

      {/* ยอดรวม + ปุ่มยืนยัน แสดงเฉพาะเมื่อมีช่องที่เลือก */}
      {hasSelection && (
        <>
          <div className="mt-2 flex w-full items-center justify-between border-t border-indigo-100 pt-4">
            <span className="text-sm text-[#4A5470]">Total</span>
            <span className="font-bold text-xl text-[#A33900]">฿ {total}/day</span>
          </div>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!allFilled || isSubmitting}
            className="min-h-11 w-full rounded-xl bg-[#8A3F1D] px-4 font-bold text-white hover:bg-[#6F3217] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Booking..." : "Confirm booking"}
          </button>
        </>
      )}
    </div>
  )
}
