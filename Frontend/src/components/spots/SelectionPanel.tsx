'use client'

import { useState } from "react"
import Link from "next/link"
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
  isLoggedIn: boolean
  selectedDate: string
}

export default function SelectionPanel({
  selectedSpots,
  onRemove,
  onConfirm,
  maxSpots,
  productTypes,
  onProductTypeChange,
  alreadyBookedCount,
  isSubmitting,
  results,
  isLoggedIn,
  selectedDate,
}: Props) {
  // ---------- State ----------
  // เก็บ id ของช่องที่ผู้ใช้ "แตะแล้วออก" (blur) จะได้ไม่แดงตั้งแต่ยังไม่ได้พิมพ์
  const [touchedIds, setTouchedIds] = useState<string[]>([])

  // ---------- Derived data ----------
  const hasSelection = selectedSpots.length > 0
  const total = selectedSpots.reduce((sum, spot) => sum + spot.rentalFee, 0)

  const usedCount = alreadyBookedCount + selectedSpots.length
  const limitReached = usedCount >= maxSpots

  // ทุกช่องที่เลือกต้องกรอก product type แล้ว
  const allFilled = selectedSpots.every(
    (spot) => (productTypes[spot._id] ?? "").trim() !== ""
  )

  // แสดง error เมื่อ "เคยแตะแล้ว" และ "ยังว่าง"
  function showError(id: string) {
    return touchedIds.includes(id) && (productTypes[id] ?? "").trim() === ""
  }

  function markTouched(id: string) {
    setTouchedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const dateLabel = new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })

  // ---------- Render ----------
  return (
    <div className="flex w-full flex-col items-start gap-2 rounded-3xl border border-indigo-100 bg-white px-6 py-5">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <h2 className="text-xl font-bold">Your selection</h2>
        <p className="text-sm text-[#4A5470]">{dateLabel}</p>
      </div>
      
      {/* แถบโควตา 3 ช่อง */}
      <div className="flex w-full gap-1.5" aria-hidden="true">
        {Array.from({ length: maxSpots }, (_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded ${i < usedCount ? "bg-[#8A3F1D]" : "bg-slate-200"}`}
          />
        ))}
      </div>

      {/* ผลการจองรายช่อง */}
      {results.length > 0 && (
        <ul role="status" className="w-full space-y-1 text-sm">
          {results.map((r) => (
            <li key={r.spotId} className={r.ok ? "text-emerald-700" : "text-red-700"}>
              {r.label}: {r.ok ? "booked" : r.error}
            </li>
          ))}
        </ul>
      )}

      {/* ตัวนับโควตา */}
      {usedCount > 0 && (
        <p className="text-sm text-[#4A5470]">
          {selectedSpots.length} selected + {alreadyBookedCount} already booked = {usedCount} of{" "}
          {maxSpots} spots
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
                <div className="flex items-center justify-between gap-2.5">
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
                <label htmlFor={`product-${spot._id}`} className="text-sm font-semibold">
                  Product Type <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <input
                  type="text"
                  id={`product-${spot._id}`}
                  required
                  value={productTypes[spot._id] ?? ""}
                  onChange={(e) => onProductTypeChange(spot._id, e.target.value)}
                  onBlur={() => markTouched(spot._id)}
                  aria-invalid={showError(spot._id)}
                  placeholder="e.g. Grilled pork skewers"
                  className={`h-10 w-full rounded-lg border px-3 text-sm ${
                    showError(spot._id) ? "border-red-500" : "border-[#CFD8EE]"
                  }`}
                />
                {showError(spot._id) && (
                  <p className="text-xs text-red-700">Required</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ยอดรวม + ปุ่มยืนยัน (หรือปุ่ม login) แสดงเฉพาะเมื่อมีช่องที่เลือก */}
      {hasSelection && (
        <>
          <div className="mt-2 flex w-full items-center justify-between border-t border-indigo-100 pt-4">
            <span className="text-sm text-[#4A5470]">Total</span>
            <span className="text-xl font-bold text-[#A33900]">฿ {total}/day</span>
          </div>

          {isLoggedIn ? (
            <>
              {!allFilled && (
                <p className="w-full text-sm text-amber-800">
                  Fill in the product type for every spot to continue.
                </p>
              )}
              <button
                type="button"
                onClick={onConfirm}
                disabled={!allFilled || isSubmitting}
                className="min-h-11 w-full rounded-xl bg-[#8A3F1D] px-4 font-bold text-white hover:bg-[#6F3217] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? "Booking..." : "Confirm booking"}
              </button>
            </>
          ) : (
            <>
              <p className="w-full rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                You&apos;re browsing as a guest. Log in to confirm your booking.
              </p>
              <Link
                href="/login"
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-[#8A3F1D] px-4 font-bold text-white hover:bg-[#6F3217]"
              >
                Log in to book
              </Link>
            </>
          )}
        </>
      )}
    </div>
  )
}