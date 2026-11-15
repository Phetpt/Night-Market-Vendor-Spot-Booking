export default function Loading() {
  const block = "animate-pulse rounded bg-slate-200"
  const card = "animate-pulse rounded-2xl border border-[#DDE3F2] bg-white"

  return (
    <div className="space-y-6 px-6 py-8" aria-busy="true">
      <span className="sr-only">Loading your bookings…</span>

      <div className="space-y-2">
        <div className={`${block} h-6 w-44 rounded-full`} />
        <div className={`${block} h-9 w-56`} />
        <div className={`${block} h-5 w-80 max-w-full`} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${card} h-[130px]`} />
        ))}
      </div>

      <div className={`${block} h-7 w-64`} />
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className={`${card} h-[150px]`} />
        ))}
      </div>
    </div>
  )
}
