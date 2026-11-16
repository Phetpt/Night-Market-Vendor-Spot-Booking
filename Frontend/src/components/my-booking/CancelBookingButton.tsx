"use client"

import { useRef, useState, useTransition } from "react"
import type { ReactNode } from "react"
import { CircleAlert, CircleX, Gauge, Trash2, X } from "lucide-react"
import { cancelBooking } from "@/lib/my-booking/actions"
import { formatCurrency } from "@/lib/spots/format"

type Props = {
  bookingId: string
  spotNumber: string
  zone: string
  productType: string
  bookingRef: string
  fee: number
  dateLabel: string
  shortDate: string
  usedOnNight: number
  dailyLimit: number
  memberName?: string // admin เห็นชื่อเจ้าของ booking
  compact?: boolean // ปุ่มเล็กสำหรับตาราง
  returnTo?: string // หน้าที่ต้องกลับมาถ้า session หมดอายุ
}

function Row({ tone, icon, children }: { tone: string; icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm text-[#4A5470]">
      <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${tone}`}>
        {icon}
      </span>
      <span>{children}</span>
    </li>
  )
}

export default function CancelBookingButton({
  bookingId,
  spotNumber,
  zone,
  productType,
  bookingRef,
  fee,
  dateLabel,
  shortDate,
  usedOnNight,
  dailyLimit,
  memberName,
  compact,
  returnTo,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const failed = error !== null

  function openDialog() {
    setError(null)
    dialogRef.current?.showModal()
  }

  function closeDialog() {
    if (!pending) dialogRef.current?.close()
  }

  function confirm() {
    setError(null)
    startTransition(async () => {
      const result = await cancelBooking(bookingId, returnTo)
      if (result.ok) {
        dialogRef.current?.close()
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={
          compact
            ? "rounded-xl border border-[#DDE3F2] bg-white px-3 py-1.5 text-sm font-semibold text-[#1B2038] hover:border-[#8A3F1D]/50 hover:bg-[#FFF4EC] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
            : "rounded-xl border border-[#DDE3F2] bg-white px-4 py-2 text-sm font-semibold text-[#1B2038] hover:border-[#8A3F1D]/50 hover:bg-[#FFF4EC] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
        }
      >
        {compact ? "Cancel" : "Cancel Booking"}
      </button>

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          if (pending) e.preventDefault()
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog()
        }}
        className="m-auto w-full max-w-[420px] rounded-2xl border border-[#DDE3F2] bg-white text-[#1B2038] backdrop:bg-black/40"
      >
        <div className="space-y-4 p-6">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-[#1F2A44]">
                Cancel booking {spotNumber}?
              </h2>
              <p className="text-sm text-[#4A5470]">{dateLabel}</p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              disabled={pending}
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-lg border border-[#DDE3F2] text-[#4A5470] hover:bg-slate-100 disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Error banner */}
          {failed && (
            <div
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700"
            >
              <span className="font-bold">Couldn&apos;t cancel.</span> {error}{" "}
              {memberName ? `${memberName}'s booking` : "Your booking"} is unchanged.
            </div>
          )}

          {/* Booking summary */}
          <div className="flex items-center gap-3 rounded-xl border border-[#DDE3F2] bg-[#EFF4FF] p-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#FFF4EC] text-sm font-bold text-[#8A3F1D]">
              {spotNumber}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#1B2038]">
                {zone} · {productType}
              </p>
              <p className="text-xs text-[#4A5470]">Booking ref {bookingRef}</p>
            </div>
            <p className="text-sm font-bold text-[#A33900]">{formatCurrency(fee)}</p>
          </div>

          {/* What will happen */}
          <ul className="space-y-2.5">
            <Row tone="bg-red-50 text-red-600" icon={<CircleAlert className="size-3.5" />}>
              The spot is <strong className="text-[#1B2038]">released right away</strong> and
              anyone can book it.
            </Row>
            <Row tone="bg-blue-50 text-blue-700" icon={<Gauge className="size-3.5" />}>
              {memberName ? `${memberName}'s quota` : "Your quota"} for {shortDate} goes from{" "}
              <strong className="text-[#1B2038]">
                {usedOnNight} / {dailyLimit}
              </strong>{" "}
              to{" "}
              <strong className="text-[#1B2038]">
                {Math.max(usedOnNight - 1, 0)} / {dailyLimit}
              </strong>
              .
            </Row>
            <Row tone="bg-slate-100 text-slate-600" icon={<CircleX className="size-3.5" />}>
              This can&apos;t be undone.{" "}
              {memberName ? `${memberName} would need` : "You'd need"} to book the spot again.
            </Row>
          </ul>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeDialog}
              disabled={pending}
              className="rounded-xl border border-[#DDE3F2] bg-white px-4 py-2 text-sm font-semibold text-[#1B2038] hover:bg-[#FFF4EC] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
            >
              {failed ? "Close" : "No, keep it"}
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={pending}
              className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 disabled:bg-red-300 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
            >
              {pending ? "Cancelling…" : failed ? "Try again" : "Yes, cancel booking"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
