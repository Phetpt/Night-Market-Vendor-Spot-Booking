"use client"

import { useId } from "react"
import { CalendarDays, CircleCheck, Lock } from "lucide-react"

import { Section, Tile, inputBase, label } from "./booking-ui"

const toDisplay = (d: string) => d.split("-").reverse().join("/")

type Props = {
  editing: boolean
  today: string
  originalDate: string // วันที่ที่บันทึกไว้ (แสดงในโหมดดู)
  productType: string // สินค้าที่บันทึกไว้ (แสดงในโหมดดู)
  date: string
  product: string
  dateError: string | null
  productError: string | null
  disabled: boolean
  onDateChange: (value: string) => void
  onProductChange: (value: string) => void
}

export default function BookingParametersSection({
  editing,
  today,
  originalDate,
  productType,
  date,
  product,
  dateError,
  productError,
  disabled,
  onDateChange,
  onProductChange,
}: Props) {
  const dateId = useId()
  const productId = useId()

  return (
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
              disabled={disabled}
              onChange={(e) => onDateChange(e.target.value)}
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
              disabled={disabled}
              placeholder="e.g. Grilled skewers"
              onChange={(e) => onProductChange(e.target.value)}
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
            <p className="text-lg font-semibold">{productType}</p>
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
  )
}
