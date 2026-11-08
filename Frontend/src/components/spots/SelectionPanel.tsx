import type { Spot } from "@/types/spot"

type Props = {
  selectedSpots: Spot[]
  onRemove: (id: string) => void
  onConfirm: () => void
  maxSpots?: number // เพดานช่องต่อวัน (ส่งมาจาก parent จะได้ไม่ซ้ำกับ MAX_PER_DAY)
}

export default function SelectionPanel({ selectedSpots, onRemove, onConfirm, maxSpots}: Props) {
  // ---------- Derived data ----------
  const hasSelection = selectedSpots.length > 0
  const total = selectedSpots.reduce((sum, spot) => sum + spot.rentalFee, 0)

  // ---------- Render ----------
  return (
    <div className="w-full rounded-3xl border border-indigo-100 bg-white px-6 py-5 flex flex-col items-start gap-2">
      {/* Header + ตัวนับจำนวนที่เลือก */}
      <h2 className="font-bold text-xl">Your selection</h2>
      {hasSelection && (
        <p className="text-sm text-[#4A5470]">
          {selectedSpots.length} of {maxSpots} spots
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
              className="flex items-center justify-between rounded-xl border border-indigo-100 p-3"
            >
              <div>
                <div className="font-bold">{spot.spotNumber}</div>
                <div className="text-sm text-[#4A5470]">
                  {spot.zone} · {spot.spotSize}
                </div>
              </div>
              <span className="font-bold">฿{spot.rentalFee}</span>
              <button
                type="button"
                onClick={() => onRemove(spot._id)}
                aria-label={`Remove ${spot.spotNumber}`}
                className="flex size-8 items-center justify-center rounded-lg border border-indigo-100 text-[#4A5470] hover:bg-slate-100"
              >
                X
              </button>
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
            className="min-h-11 w-full rounded-xl bg-[#8A3F1D] px-4 font-bold text-white hover:bg-[#6F3217]"
          >
            Confirm booking
          </button>
        </>
      )}
    </div>
  )
}
