import type { ReactNode } from "react"

export const label = "text-[11px] font-bold uppercase tracking-wide text-[#4A5470]"

export const inputBase =
  "h-11 w-full rounded-xl border bg-white px-3 text-sm text-[#1B2038] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"

export function Tile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className={label}>{title}</p>
      <div className="mt-1 text-[#1B2038]">{children}</div>
    </div>
  )
}

export function Section({
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
