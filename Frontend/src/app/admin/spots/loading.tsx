export default function Loading() {
  const block = "animate-pulse rounded bg-slate-200";
  const card = "animate-pulse rounded-2xl border border-[#DDE3F2] bg-white";

  return (
    <div className="space-y-6 px-6 py-8" aria-busy="true">
      <span className="sr-only">Loading spots…</span>

      <div className="space-y-2">
        <div className={`${block} h-4 w-44 rounded-full`} />
        <div className={`${block} h-9 w-72 max-w-full`} />
        <div className={`${block} h-6 w-96 max-w-full`} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`${card} h-[162px]`} />
        ))}
      </div>

      <div className={`${card} h-[110px]`} />
      <div className={`${card} h-[420px]`} />
    </div>
  );
}
