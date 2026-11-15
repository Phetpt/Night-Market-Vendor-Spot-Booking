"use client"

import { useId } from "react"
import { ChevronDown } from "lucide-react"

import type { BookingSpot } from "@/types/booking"
import type { Spot } from "@/types/spot"
import { inputBase, label } from "./booking-ui"

type Props = {
  spotsByZone: Record<string, Spot[]>
  selectedAvailable: boolean // spot ที่เลือกอยู่ยังอยู่ในรายการที่เลือกได้หรือไม่
  spotId: string
  selected: BookingSpot
  size: string
  fee: string
  spotChanged: boolean
  disabled: boolean
  onPickSpot: (id: string) => void
  onSizeChange: (value: string) => void
  onFeeChange: (value: string) => void
}

export default function AdminSpotFields({
  spotsByZone,
  selectedAvailable,
  spotId,
  selected,
  size,
  fee,
  spotChanged,
  disabled,
  onPickSpot,
  onSizeChange,
  onFeeChange,
}: Props) {
  const spotFieldId = useId()
  const sizeId = useId()
  const feeId = useId()

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={spotFieldId} className={label}>
            Spot
          </label>
          <div className="relative mt-1">
            <select
              id={spotFieldId}
              value={selectedAvailable ? spotId : ""}
              disabled={disabled}
              onChange={(e) => onPickSpot(e.target.value)}
              className={`${inputBase} appearance-none border-[#DDE3F2] pr-10`}
            >
              {!selectedAvailable && (
                <option value="" disabled>
                  Pick an available spot…
                </option>
              )}
              {Object.entries(spotsByZone).map(([zone, list]) => (
                <optgroup key={zone} label={zone}>
                  {list.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.spotNumber} · {s.spotSize} · ฿{s.rentalFee.toLocaleString("en-US")}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#4A5470]"
            />
          </div>
        </div>

        <div>
          <p className={label}>Market zone</p>
          <div
            className={`${inputBase} mt-1 flex items-center gap-2 border-[#DDE3F2] font-semibold`}
            aria-readonly="true"
          >
            {selected.zone}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={sizeId} className={label}>
            Physical footprint
          </label>
          <input
            id={sizeId}
            type="text"
            maxLength={50}
            value={size}
            disabled={disabled}
            onChange={(e) => onSizeChange(e.target.value)}
            className={`${inputBase} mt-1 border-[#DDE3F2]`}
          />
        </div>
        <div>
          <label htmlFor={feeId} className={label}>
            Rental fee (฿ / night)
          </label>
          <input
            id={feeId}
            type="number"
            min={0}
            step="1"
            value={fee}
            disabled={disabled}
            onChange={(e) => onFeeChange(e.target.value)}
            className={`${inputBase} mt-1 border-[#DDE3F2]`}
          />
        </div>
      </div>

      {spotChanged && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Footprint and fee belong to spot {selected.spotNumber}. Saving changes them for every
          booking of this spot, not only this one.
        </p>
      )}
    </div>
  )
}
