type Props = {
  zones: string[]                  // รวม "all" เป็นตัวแรก (parent เป็นคนใส่)
  active: string
  counts: Record<string, number>   // จำนวนช่องต่อโซน key ตรงกับ zones
  openCount: number
  bookCount: number
  onChange: (zone: string) => void
}

export default function ZoneTabs({ zones, active, counts, openCount, bookCount, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* แท็บโซน */}
      {zones.map((zone) => {
        const isActive = zone === active
        return (
          <button
            key={zone}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(zone)}
            className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${
              isActive
                ? "border-[#1B2038] bg-[#1B2038] text-white"
                : "border-[#CFD8EE] bg-white text-[#1B2038] hover:border-slate-500"
            }`}
          >
            {zone === "all" ? "All zones" : zone} · {counts[zone] ?? 0}
          </button>
        )
      })}

      {/* สรุปช่องว่าง/ถูกจอง (ดันไปขวาสุด) */}
      <p className="ml-auto text-sm text-[#4A5470]">
        Open {openCount} · Booked {bookCount}
      </p>
    </div>
  )
}
