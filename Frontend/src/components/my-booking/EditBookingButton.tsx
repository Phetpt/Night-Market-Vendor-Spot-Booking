"use client"

import { useId, useRef, useState, useTransition } from "react"
import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
  Bookmark,
  CalendarDays,
  CircleCheck,
  Lock,
  Pencil,
  Ruler,
  Store,
  User,
  X,
} from "lucide-react"

import { updateBooking } from "@/lib/my-booking/actions"
import { formatShortDate } from "@/lib/my-booking/format"
import type { Booking } from "@/types/booking"

type Props = {
  booking: Booking
  today: string
  nightCounts: Record<string, number>
  dailyLimit: number
}

const label = "text-[11px] font-bold uppercase tracking-wide text-[#4A5470]"
const inputBase =
  "h-11 w-full rounded-xl border bg-white px-3 text-sm text-[#1B2038] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
const toDisplay = (d: string) => d.split("-").reverse().join("/")

function Tile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className={label}>{title}</p>
      <div className="mt-1 text-[#1B2038]">{children}</div>
    </div>
  )
}

function Section({
  icon,
  title,
  right,
  className = "",
  children,
}: {
  icon: ReactNode
  title: string
  right?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={`rounded-2xl p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-[#1F2A44]">
          <span className="text-[#8A3F1D]">{icon}</span>
          {title}
        </h3>
        <span className="flex items-center gap-1 text-xs font-semibold text-[#4A5470]">{right}</span>
      </div>
      {children}
    </section>
  )
}

export default function EditBookingButton({ booking, today, nightCounts, dailyLimit }: Props) {
  const { spot, user } = booking
  const router = useRouter()
  const originalDate = booking.bookingDate.slice(0, 10)
  const ref = `#${booking._id.slice(-8).toUpperCase()}`
  const dateId = useId()
  const productId = useId()

  const dialogRef = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [date, setDate] = useState(originalDate)
  const [product, setProduct] = useState(booking.productType)
  const [dateError, setDateError] = useState<string | null>(null)
  const [productError, setProductError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const editing = mode === "edit"
  const hasFieldError = dateError !== null || productError !== null

  function reset() {
    setDate(originalDate)
    setProduct(booking.productType)
    setDateError(null)
    setProductError(null)
    setBanner(null)
  }

  function openDialog() {
    reset()
    setMode("view") // เปลี่ยนเป็น "edit" ถ้าอยากให้กดแล้วเข้าโหมดแก้ไขทันที
    dialogRef.current?.showModal()
  }

  function closeDialog() {
    if (!pending) dialogRef.current?.close()
  }

  function discard() {
    reset()
    setMode("view")
  }

  function validate(): boolean {
    let ok = true
    setBanner(null)

    if (product.trim().length === 0) {
      setProductError("Product type is required")
      ok = false
    } else {
      setProductError(null)
    }

    if (!date) {
      setDateError("Pick a date")
      ok = false
    } else if (date < today) {
      setDateError("Pick today or a later date")
      ok = false
    } else if (date !== originalDate && (nightCounts[date] ?? 0) >= dailyLimit) {
      setDateError(`Limit reached on ${formatShortDate(date)}`)
      setBanner(`You already have ${dailyLimit} spots on that night. Pick another date.`)
      ok = false
    } else {
      setDateError(null)
    }

    return ok
  }

  function save() {
    if (!validate()) return
    startTransition(async () => {
      const result = await updateBooking({
        bookingId: booking._id,
        spotId: spot._id,
        bookingDate: date,
        productType: product.trim(),
      })
      if (result.ok) {
        dialogRef.current?.close()
        setMode("view")
        router.refresh()
      } else {
        setBanner(result.message)
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="rounded-xl border border-[#8A3F1D] px-4 py-2 text-sm font-semibold text-[#8A3F1D] hover:bg-[#8A3F1D] hover:text-white focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
      >
        Edit Booking
      </button>

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          if (pending) e.preventDefault()
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog()
        }}
        className="m-auto max-h-[92vh] w-full max-w-[820px] overflow-y-auto rounded-2xl border border-[#DDE3F2] bg-white p-0 text-[#1B2038] backdrop:bg-black/40"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#8A3F1D] to-emerald-600" />

        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBE3D6] px-3 py-1 text-xs font-bold text-[#8A3F1D]">
                  <Bookmark className="size-3.5" />
                  {ref}
                </span>
                {editing ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-900">
                    <Pencil className="size-3.5" />
                    Editing
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-900">
                    <span className="size-2 rounded-full bg-emerald-600" />
                    Confirmed spot
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-[#1F2A44]">
                {editing ? "Edit Booking" : "Booking Details"}
              </h2>
              <p className="text-[#4A5470]">
                {editing
                  ? "Update the night or product type. The spot stays the same."
                  : "Your reservation record for this market night."}
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              disabled={pending}
              aria-label="Close"
              className="flex size-10 items-center justify-center rounded-xl bg-[#EFF4FF] text-[#1B2038] hover:bg-slate-200 disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>

          {banner && (
            <div
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700"
            >
              {banner}
            </div>
          )}

          <Section
            icon={<User className="size-4" />}
            title="Registered Member"
            className="bg-[#EFF4FF]"
            right={
              editing ? (
                <>
                  <Lock className="size-3.5" /> Read-only
                </>
              ) : (
                <span className="rounded-md bg-white px-2 py-0.5 font-bold uppercase text-[#1F2A44]">
                  Member
                </span>
              )
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              <Tile title="Full name">
                <p className="font-semibold">{user.name}</p>
              </Tile>
              <Tile title="Email address">
                <p className="break-all font-semibold">{user.email}</p>
              </Tile>
            </div>
          </Section>

          <Section
            icon={<Store className="size-4" />}
            title="Spot Identification"
            className="bg-[#EFF4FF]"
            right={
              editing ? (
                <>
                  <Lock className="size-3.5" /> Read-only
                </>
              ) : null
            }
          >
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
          </Section>

          <Section
            icon={<CalendarDays className="size-4" />}
            title="Booking Parameters"
            className={editing ? "border-2 border-[#8A3F1D] bg-white" : "bg-[#EFF4FF]"}
            right={
              editing ? (
                "Editing these fields"
              ) : (
                <>
                  <Lock className="size-3.5" /> Editable before market day
                </>
              )
            }
          >
            {editing ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label htmlFor={dateId} className={label}>
                    Scheduled date
                  </label>
                  <input
                    id={dateId}
                    type="date"
                    min={today}
                    value={date}
                    disabled={pending}
                    onChange={(e) => setDate(e.target.value)}
                    aria-invalid={dateError !== null}
                    className={`${inputBase} mt-1 ${dateError ? "border-red-500" : "border-[#DDE3F2]"}`}
                  />
                  {dateError && <p className="mt-1 text-xs font-semibold text-red-700">{dateError}</p>}
                </div>

                <div>
                  <label htmlFor={productId} className={label}>
                    Product category
                  </label>
                  <input
                    id={productId}
                    type="text"
                    maxLength={100}
                    value={product}
                    disabled={pending}
                    placeholder="e.g. Grilled skewers"
                    onChange={(e) => setProduct(e.target.value)}
                    aria-invalid={productError !== null}
                    className={`${inputBase} mt-1 ${productError ? "border-red-500" : "border-[#DDE3F2]"}`}
                  />
                  {productError && (
                    <p className="mt-1 text-xs font-semibold text-red-700">{productError}</p>
                  )}
                </div>

                <div>
                  <p className={label}>Current status</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-900">
                    <CircleCheck className="size-4" />
                    Confirmed
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-3">
                <Tile title="Scheduled date">
                  <p className="text-lg font-semibold">{toDisplay(originalDate)}</p>
                </Tile>
                <Tile title="Product category">
                  <p className="text-lg font-semibold">{booking.productType}</p>
                </Tile>
                <Tile title="Current status">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-900">
                    <CircleCheck className="size-4" />
                    Confirmed
                  </span>
                </Tile>
              </div>
            )}
          </Section>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EFF4FF] px-6 py-4">
          <p
            className={`text-sm ${hasFieldError ? "font-semibold text-red-700" : "text-[#4A5470]"}`}
          >
            {editing
              ? hasFieldError
                ? "Fix the highlighted field to save"
                : "Only date and product type can be changed"
              : ""}
          </p>

          <div className="flex flex-wrap gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={discard}
                  disabled={pending}
                  className="rounded-xl border border-[#DDE3F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#1B2038] hover:bg-[#FFF4EC] disabled:opacity-50"
                >
                  Discard changes
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={pending}
                  className="rounded-xl bg-[#8A3F1D] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6F3217] disabled:bg-[#C49A86]"
                >
                  {pending ? "Saving…" : "Save changes"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-xl border border-[#DDE3F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#1B2038] hover:bg-[#FFF4EC]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#8A3F1D] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6F3217]"
                >
                  <Pencil className="size-4" />
                  Edit Booking
                </button>
              </>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}