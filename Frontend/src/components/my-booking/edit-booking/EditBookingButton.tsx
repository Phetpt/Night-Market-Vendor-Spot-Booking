"use client"

import { useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Lock, Store, User } from "lucide-react"

import { adminUpdateBooking, updateBooking } from "@/lib/my-booking/actions"
import { formatShortDate } from "@/lib/my-booking/format"
import type { Booking } from "@/types/booking"
import type { Spot } from "@/types/spot"

import AdminSpotFields from "./AdminSpotFields"
import BookingParametersSection from "./BookingParametersSection"
import { Section, Tile } from "./booking-ui"
import EditBookingFooter from "./EditBookingFooter"
import EditBookingHeader from "./EditBookingHeader"
import SpotSummary from "./SpotSummary"
import { useBookedSpots } from "./useBookedSpots"

type Props = {
  booking: Booking
  today: string
  nightCounts: Record<string, number>
  dailyLimit: number
  compact?: boolean
  returnTo?: string // หน้าที่ต้องกลับมาถ้า session หมดอายุ
  spots?: Spot[] // ส่งมาเฉพาะหน้า admin = เปิดโหมดย้าย spot / แก้ขนาด-ค่าเช่า
}

export default function EditBookingButton({
  booking,
  today,
  nightCounts,
  dailyLimit,
  compact,
  returnTo,
  spots,
}: Props) {
  const { spot, user } = booking
  const router = useRouter()
  const originalDate = booking.bookingDate.slice(0, 10)
  const refCode = `#${booking._id.slice(-8).toUpperCase()}`
  const adminMode = spots !== undefined && spots.length > 0

  const dialogRef = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<"view" | "edit">("view")
  const [date, setDate] = useState(originalDate)
  const [product, setProduct] = useState(booking.productType)
  const [spotId, setSpotId] = useState(spot._id)
  const [size, setSize] = useState(spot.spotSize)
  const [fee, setFee] = useState(String(spot.rentalFee))
  const [dateError, setDateError] = useState<string | null>(null)
  const [productError, setProductError] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const editing = mode === "edit"
  const hasFieldError = dateError !== null || productError !== null

  // ข้อความที่ต่างกันระหว่างโหมดปกติกับโหมด admin
  const hint = adminMode
    ? {
        sub: "Update the night, product type, or move this booking to another spot.",
        footer: "Spot, date, product type, footprint and fee can be changed",
      }
    : {
        sub: "Update the night or product type. The spot stays the same.",
        footer: "Only date and product type can be changed",
      }
  const subtitle = editing ? hint.sub : "Reservation record for this market night."
  const footerMessage = !editing
    ? ""
    : hasFieldError
      ? "Fix the highlighted field to save"
      : hint.footer

  const booked = useBookedSpots(date, adminMode && editing)

  // spot ที่เลือกอยู่ (ไม่ใช่โหมด admin = spot เดิมของ booking)
  const selected = spots?.find((s) => s._id === spotId) ?? spot
  const feeNumber = fee.trim() === "" ? NaN : Number(fee)
  const spotChanged =
    adminMode && (size.trim() !== selected.spotSize || feeNumber !== selected.rentalFee)

  // spot ที่เลือกได้ = ว่างในวันที่เลือก (spot เดิมของ booking นี้ยังเลือกได้ถ้าไม่เปลี่ยนวัน)
  const availableSpots = useMemo(
    () =>
      (spots ?? []).filter(
        (s) => !booked?.has(s._id) || (s._id === spot._id && date === originalDate),
      ),
    [spots, booked, spot._id, date, originalDate],
  )
  const selectedAvailable = availableSpots.some((s) => s._id === spotId)
  const spotsByZone = useMemo(() => {
    const groups: Record<string, Spot[]> = {}
    for (const s of availableSpots) (groups[s.zone] ??= []).push(s)
    return groups
  }, [availableSpots])

  function pickSpot(id: string) {
    setSpotId(id)
    const s = spots?.find((x) => x._id === id)
    if (s) {
      setSize(s.spotSize)
      setFee(String(s.rentalFee))
    }
  }

  function reset() {
    setDate(originalDate)
    setProduct(booking.productType)
    setSpotId(spot._id)
    setSize(spot.spotSize)
    setFee(String(spot.rentalFee))
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
      setBanner(`${user.name} already has ${dailyLimit} spots on that night. Pick another date.`)
      ok = false
    } else {
      setDateError(null)
    }

    if (adminMode) {
      if (!selectedAvailable) {
        setBanner("That spot is not available on the selected night. Pick another spot.")
        ok = false
      }
      if (size.trim().length === 0 || !Number.isFinite(feeNumber) || feeNumber < 0) {
        setBanner("Footprint is required and the rental fee must be 0 or more.")
        ok = false
      }
    }

    return ok
  }

  function save() {
    if (!validate()) return
    startTransition(async () => {
      const payload = {
        bookingId: booking._id,
        spotId,
        bookingDate: date,
        productType: product.trim(),
        returnTo,
      }
      const result = adminMode
        ? await adminUpdateBooking({
            ...payload,
            spotChanges: spotChanged
              ? { spotSize: size.trim(), rentalFee: feeNumber }
              : undefined,
          })
        : await updateBooking(payload)

      if (result.ok) {
        dialogRef.current?.close()
        setMode("view")
      } else {
        setBanner(result.message)
      }
      // refresh ทั้งสองกรณี: ล้มเหลวได้แบบ "บันทึกบางส่วน" (booking ถูกบันทึกแล้วแต่ spot ไม่ได้)
      // และ 409 แปลว่าข้อมูลที่ UI ถืออยู่เก่า ต้องดึงของจริงมาก่อนให้ user ลองใหม่
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={
          compact
            ? "rounded-xl border border-[#8A3F1D] px-3 py-1.5 text-sm font-semibold text-[#8A3F1D] hover:bg-[#8A3F1D] hover:text-white focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
            : "rounded-xl border border-[#8A3F1D] px-4 py-2 text-sm font-semibold text-[#8A3F1D] hover:bg-[#8A3F1D] hover:text-white focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
        }
      >
        {compact ? "Edit" : "Edit Booking"}
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
          <EditBookingHeader
            refCode={refCode}
            editing={editing}
            subtitle={subtitle}
            pending={pending}
            onClose={closeDialog}
          />

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
              editing && !adminMode ? (
                <>
                  <Lock className="size-3.5" /> Read-only
                </>
              ) : null
            }
          >
            {adminMode && editing ? (
              <AdminSpotFields
                spotsByZone={spotsByZone}
                selectedAvailable={selectedAvailable}
                spotId={spotId}
                selected={selected}
                size={size}
                fee={fee}
                spotChanged={spotChanged}
                disabled={pending}
                onPickSpot={pickSpot}
                onSizeChange={setSize}
                onFeeChange={setFee}
              />
            ) : (
              <SpotSummary spot={selected} />
            )}
          </Section>

          <BookingParametersSection
            editing={editing}
            today={today}
            originalDate={originalDate}
            productType={booking.productType}
            date={date}
            product={product}
            dateError={dateError}
            productError={productError}
            disabled={pending}
            onDateChange={setDate}
            onProductChange={setProduct}
          />
        </div>

        <EditBookingFooter
          editing={editing}
          message={footerMessage}
          isError={hasFieldError}
          pending={pending}
          onDiscard={discard}
          onSave={save}
          onClose={closeDialog}
          onEdit={() => setMode("edit")}
        />
      </dialog>
    </>
  )
}
