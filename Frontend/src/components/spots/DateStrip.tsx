import { useRef } from "react"
import { useRouter } from "next/navigation"

type Props = {
  value: string
  today: string
}

function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function labelOf(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`)
  return {
    weekday: d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }),
    dayLabel: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
  }
}

const focusRing =
  "transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"

export default function DateStrip({ value, today }: Props) {
  const router = useRouter()
  const dateInputRef = useRef<HTMLInputElement>(null)

  // วันที่เลือกอยู่กลางแถบ แต่ไม่ให้แถบเริ่มก่อนวันนี้
  const centered = addDays(value, -3)
  const start = centered < today ? today : centered
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  function openPicker() {
    const input = dateInputRef.current
    if (!input) return
    try {
      input.showPicker()
    } catch {
      input.click() // เบราว์เซอร์ที่ไม่รองรับ showPicker 
    }
  }

  return (
    <section className="rounded-2xl border border-[#DDE3F2] bg-white p-5">
      <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <h2 className="text-lg font-bold text-[#1B2038]">Trading date</h2>
        <p className="text-sm text-[#4A5470]">Past dates are disabled</p>

        <div className="relative ml-auto flex items-center gap-2 self-center">
          {/* ใช้ invisible แทนการซ่อนด้วยเงื่อนไข เพื่อให้ปุ่มอื่นไม่ขยับ */}
          <button
            type="button"
            onClick={() => router.push(`/spots?date=${today}`)}
            tabIndex={value === today ? -1 : 0}
            aria-hidden={value === today}
            className={`rounded-xl border border-[#8A3F1D] px-4 py-2 text-sm font-semibold text-[#8A3F1D] hover:bg-[#8A3F1D] hover:text-white ${focusRing} ${
              value === today ? "invisible" : ""
            }`}
          >
            Back to today
          </button>

          <button
            type="button"
            onClick={openPicker}
            className={`rounded-xl border border-[#DDE3F2] bg-white px-4 py-2 text-sm font-semibold text-[#1B2038] hover:border-[#8A3F1D]/50 hover:bg-[#FFF4EC] ${focusRing}`}
          >
            More dates
          </button>

          {/* input ซ่อนไว้ ใช้เป็นตัวเปิดปฏิทินเท่านั้น */}
          <input
            ref={dateInputRef}
            type="date"
            min={today}
            value={value}
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              if (e.target.value && e.target.value >= today) {
                router.push(`/spots?date=${e.target.value}`)
              }
            }}
            className="pointer-events-none absolute right-0 top-full h-0 w-0 opacity-0"
          />
        </div>
      </div>

      {/* pt-2 เผื่อที่ให้ป้าย Today ที่คร่อมขอบบนของกล่อง */}
      <div className="grid grid-cols-4 gap-2 pt-2 md:grid-cols-7 md:gap-3">
        {days.map((iso) => {
          const { weekday, dayLabel } = labelOf(iso)
          const isSelected = iso === value
          const isPast = iso < today
          const isToday = iso === today

          return (
            <button
              key={iso}
              type="button"
              disabled={isPast}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              onClick={() => router.push(`/spots?date=${iso}`)}
              className={`relative flex h-20 flex-col items-center justify-center rounded-xl border px-3 text-center text-sm disabled:cursor-not-allowed ${focusRing} ${
                isSelected
                  ? "border-[#8A3F1D] bg-[#8A3F1D] text-white shadow-md shadow-[#8A3F1D]/20"
                  : isPast
                    ? "border-transparent bg-[#EEF0F7] text-[#8F96B3]"
                    : isToday
                      ? "border-[#8A3F1D] bg-white text-[#1B2038] hover:bg-[#FFF4EC]"
                      : "border-[#DDE3F2] bg-white text-[#1B2038] hover:border-[#8A3F1D]/50 hover:bg-[#FFF4EC]"
              }`}
            >
              {isToday && (
                <span
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border border-[#8A3F1D] px-2 text-[10px] font-bold uppercase leading-4 ${
                    isSelected ? "bg-white text-[#8A3F1D]" : "bg-[#8A3F1D] text-white"
                  }`}
                >
                  Today
                </span>
              )}

              <span className="block font-bold">{weekday}</span>
              <span
                className={`block ${
                  isSelected ? "text-white/85" : isPast ? "" : "text-[#4A5470]"
                }`}
              >
                {dayLabel}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}