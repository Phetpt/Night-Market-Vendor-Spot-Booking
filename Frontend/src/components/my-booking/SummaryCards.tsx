import { Moon, Ticket, Wallet } from "lucide-react"

type Props = {
  usedOnNextNight: number
  dailyLimit: number
  nextDateLabel: string
  count: number
  nextSpotNumber: string | number
  relative: string
  totalFees: number
}

const card = "rounded-2xl border border-[#DDE3F2] bg-white p-5"
const iconCircle =
  "flex size-10 items-center justify-center rounded-full bg-[#FFF4EC] text-[#8A3F1D]"
const label = "text-sm font-semibold text-[#4A5470]"

export default function SummaryCards({
  usedOnNextNight,
  dailyLimit,
  nextDateLabel,
  count,
  nextSpotNumber,
  relative,
  totalFees,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 1) โควต้าของคืนถัดไป */}
      <article className={card}>
        <div className="flex items-center gap-3">
          <div className={iconCircle}>
            <Moon className="size-5" />
          </div>
          <div>
            <p className={label}>Next night quota</p>
            <p className="text-xs text-[#4A5470]">{nextDateLabel}</p>
          </div>
        </div>
        <p className="mt-4 text-2xl font-bold text-[#1F2A44]">
          {usedOnNextNight} / {dailyLimit}
          <span className="ml-1 text-sm font-semibold text-[#4A5470]">spots</span>
        </p>
        <div className="mt-3 flex gap-2">
          {Array.from({ length: dailyLimit }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded ${
                i < usedOnNextNight ? "bg-[#8A3F1D]" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </article>

      {/* 2) จำนวน booking ที่กำลังจะมาถึง */}
      <article className={card}>
        <div className="flex items-center gap-3">
          <div className={iconCircle}>
            <Ticket className="size-5" />
          </div>
          <p className={label}>Upcoming bookings</p>
        </div>
        <p className="mt-4 text-2xl font-bold text-[#1F2A44]">{count}</p>
        <div className="mt-3 flex items-center gap-2 text-sm text-[#4A5470]">
          <span>Next: Spot {nextSpotNumber}</span>
          {relative && (
            <span className="rounded-full border border-[#8A3F1D] bg-[#FFF4EC] px-2 py-0.5 text-xs font-bold text-[#8A3F1D]">
              {relative}
            </span>
          )}
        </div>
      </article>

      {/* 3) ค่าเช่ารวม */}
      <article className={card}>
        <div className="flex items-center gap-3">
          <div className={iconCircle}>
            <Wallet className="size-5" />
          </div>
          <p className={label}>Total fees (upcoming)</p>
        </div>
        <p className="mt-4 text-2xl font-bold text-[#A33900]">
          ฿{totalFees.toLocaleString("en-US")}
        </p>
        <p className="mt-3 text-sm text-[#4A5470]">Across all upcoming nights</p>
      </article>
    </div>
  )
}