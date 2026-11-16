"use client";

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { ChevronDown, Layers, MapPin, Search, Wallet } from "lucide-react"
import type { Spot } from "@/types/spot"
import SpotFormButton from "@/components/admin/spots/SpotFormButton"
import DeleteSpotButton from "@/components/admin/spots/DeleteSpotButton"
import { formatCurrency, formatSpotSize, sizeArea } from "@/lib/spots/format"

type Props = { spots: Spot[] };

const baht = formatCurrency;
const byNumber = (a: Spot, b: Spot) =>
  a.spotNumber.localeCompare(b.spotNumber, undefined, { numeric: true });

function zoneLabel(zone: string) {
  return zone.trim();
}

function feeRange(rows: Spot[]) {
  const fees = rows.map((s) => s.rentalFee);
  const lo = Math.min(...fees);
  const hi = Math.max(...fees);
  return lo === hi ? baht(lo) : `${baht(lo)}–${baht(hi)}`;
}

// สีป้ายโซน: ได้จากแฮชของชื่อโซน ชื่อเดิมจึงได้สีเดิมเสมอ (ไม่เลื่อนตามลำดับ)
const ZONE_PILLS = [
  "bg-[#FFF4EC] text-[#8A3F1D]",
  "bg-[#E8F8F5] text-[#0B6B5D]",
  "bg-[#EEF3FF] text-[#2347B8]",
  "bg-[#F4EFFF] text-[#5B3BB5]",
  "bg-[#F1F3F9] text-[#4A5470]",
];

function zonePill(zone: string) {
  let h = 0;
  for (const ch of zone.trim().toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ZONE_PILLS[h % ZONE_PILLS.length];
}

// ---- style ชุดเดียวกับ AdminBookingsExplorer ----
const fieldBase =
  "h-11 w-full rounded-xl border border-[#DDE3F2] bg-white text-sm text-[#1F2A44] outline-none focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2";
const selectClass = `${fieldBase} appearance-none pl-3 pr-9`;
const searchClass = `${fieldBase} pl-9 pr-3`;
const card = "rounded-2xl border border-[#DDE3F2] bg-white p-5";
const iconCircle =
  "flex size-10 items-center justify-center rounded-full bg-[#FFF4EC] text-[#8A3F1D]";
// ระยะเท่ากับตารางใน AdminBookingsExplorer (px-4 py-3)
const th = "px-4 py-3";
const td = "px-4 py-3";

function Stat({
  icon,
  label,
  value,
  sub,
  valueClass = "text-[#1F2A44]",
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub: string;
  valueClass?: string;
}) {
  return (
    <article className={card}>
      <div className="flex items-center gap-3">
        <div className={iconCircle}>{icon}</div>
        <p className="text-sm font-semibold text-[#4A5470]">{label}</p>
      </div>
      <p className={`mt-4 text-2xl font-bold ${valueClass}`}>{value}</p>
      <p className="mt-3 text-sm text-[#4A5470]">{sub}</p>
    </article>
  );
}

function SelectBox({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClass}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#4A5470]"
      />
    </div>
  );
}

export default function AdminSpotsExplorer({ spots }: Props) {
  const [zone, setZone] = useState("all");
  const [size, setSize] = useState("all");
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => [...spots].sort(byNumber), [spots]);
  
  // เรียงโซนตาม spot แรกที่เจอ (A01 -> B01 -> ...)
  const zones = useMemo(() => [...new Set(sorted.map((s) => s.zone))], [sorted]);
  const sizes = useMemo(
    () =>
      [...new Set(sorted.map((s) => formatSpotSize(s.spotSize)))].sort(
        (a, b) => sizeArea(a) - sizeArea(b) || a.localeCompare(b, undefined, { numeric: true }),
      ),
    [sorted],
  );


  // ถ้าโซน/ขนาดที่เลือกไว้หายไปแล้ว (เช่นลบ spot สุดท้ายของโซน) ให้ถือว่าเลือก "all"
  const activeZone = zones.includes(zone) ? zone : "all";
  const activeSize = sizes.includes(size) ? size : "all";
  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      sorted
        .filter((s) => activeZone === "all" || s.zone === activeZone)
        .filter((s) => activeSize === "all" || formatSpotSize(s.spotSize) === activeSize)
        .filter(
          (s) =>
            q === "" ||
            s.spotNumber.toLowerCase().includes(q) ||
            s.locationDescription.toLowerCase().includes(q),
        ),
    [sorted, activeZone, activeSize, q],
  );

  const avgFee = sorted.length
    ? Math.round(sorted.reduce((sum, s) => sum + s.rentalFee, 0) / sorted.length)
    : 0;
  const filtersActive = activeZone !== "all" || activeSize !== "all" || q !== "";

  function clearFilters() {
    setZone("all");
    setSize("all");
    setQuery("");
  }

  return (
    <div className="space-y-6 px-6 py-8">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8A3F1D]">
            Admin workspace{" "}
            <span className="font-normal normal-case text-[#4A5470]">/ Spots</span>
          </p>
          <h1 className="text-3xl font-bold text-[#1F2A44]">Manage spots</h1>
          <p className="text-[#4A5470]">Add, edit and remove the stalls vendors can book.</p>
        </div>
        <SpotFormButton mode="create" spots={sorted} />
      </header>

      {/* Summary: คำนวณจาก spot ทั้งหมด ไม่เปลี่ยนตาม filter */}
      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          icon={<MapPin className="size-5" />}
          label="Active spots"
          value={sorted.length}
          sub="Spots vendors can book today"
        />
        <Stat
          icon={<Layers className="size-5" />}
          label="Zones"
          value={zones.length}
          sub={zones.length ? zones.map(zoneLabel).join(", ") : "No zones yet"}
        />
        <Stat
          icon={<Wallet className="size-5" />}
          label="Rental fee range"
          value={sorted.length ? feeRange(sorted) : "—"}
          sub={
            sorted.length
              ? `Average ${baht(avgFee)} per spot per night`
              : "Add a spot to see fees"
          }
          valueClass="text-[#A33900]"
        />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-[#DDE3F2] bg-white p-8 text-center text-sm text-[#4A5470]">
          <p className="font-bold text-[#1F2A44]">No active spots yet</p>
          <p className="mt-1">Use “Add spot” to create the first one.</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#DDE3F2] bg-white p-5">
            <div className="min-w-[240px] flex-[2]">
              <label
                htmlFor="spot-search"
                className="mb-1 block text-sm font-semibold text-[#1F2A44]"
              >
                Search
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4A5470]"
                />
                <input
                  id="spot-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Spot number or location"
                  className={searchClass}
                />
              </div>
            </div>
            <div className="min-w-[200px] flex-1">
              <label
                htmlFor="spot-zone"
                className="mb-1 block text-sm font-semibold text-[#1F2A44]"
              >
                Zone
              </label>
              <SelectBox id="spot-zone" value={activeZone} onChange={setZone}>
                <option value="all">All zones</option>
                {zones.map((z) => (
                  <option key={z} value={z}>
                    {zoneLabel(z)}
                  </option>
                ))}
              </SelectBox>
            </div>
            <div className="min-w-[200px] flex-1">
              <label
                htmlFor="spot-size"
                className="mb-1 block text-sm font-semibold text-[#1F2A44]"
              >
                Size
              </label>
              <SelectBox id="spot-size" value={activeSize} onChange={setSize}>
                <option value="all">All sizes</option>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectBox>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!filtersActive}
              className="min-h-11 rounded-xl border border-[#DDE3F2] bg-white px-4 text-sm font-semibold text-[#1B2038] hover:bg-[#FFF4EC] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2 disabled:opacity-60"
            >
              Clear
            </button>
          </div>

          {/* Table card: ตารางแบน แถวละ 1 spot โซนแสดงเป็นป้ายสี */}
          <section className={card}>
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-xl font-bold text-[#1F2A44]">
                Spots · {activeZone === "all" ? "All zones" : zoneLabel(activeZone)}
              </h2>
              <span className="text-sm text-[#4A5470]">{filtered.length} total</span>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl bg-[#EFF4FF] p-8 text-center text-sm text-[#4A5470]">
                <p className="font-bold text-[#1F2A44]">No spots found</p>
                <p className="mt-1">No spots match your filters. Try clearing them.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] table-fixed text-left text-sm">
                  <thead className="bg-[#EFF4FF] text-xs font-bold uppercase tracking-wide text-[#4A5470]">
                    <tr>
                      <th className={`${th} w-[13%] rounded-l-xl`}>Spot</th>
                      <th className={`${th} w-[17%]`}>Zone</th>
                      <th className={`${th} w-[13%]`}>Size</th>
                      <th className={`${th} w-[27%]`}>Location</th>
                      <th className={`${th} w-[12%]`}>Rental fee</th>
                      <th className={`${th} w-[18%] rounded-r-xl`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr
                        key={s._id}
                        className="border-b border-[#DDE3F2] last:border-b-0 hover:bg-[#FFF4EC]"
                      >
                        <td className={`${td} align-middle font-bold text-[#1B2038]`}>
                          {s.spotNumber}
                        </td>
                        <td className={`${td} align-middle`}>
                          <span
                            className={`inline-block max-w-full truncate rounded-md px-2.5 py-0.5 align-middle text-xs font-semibold ${zonePill(s.zone)}`}
                            title={zoneLabel(s.zone)}
                          >
                            {zoneLabel(s.zone)}
                          </span>
                        </td>
                        <td className={`${td} whitespace-nowrap align-middle text-[#4A5470]`}>
                          {formatSpotSize(s.spotSize)}
                        </td>
                        <td className={`${td} align-middle text-[#4A5470]`}>
                          <div className="truncate" title={s.locationDescription}>
                            {s.locationDescription}
                          </div>
                        </td>
                        <td
                          className={`${td} whitespace-nowrap align-middle font-semibold tabular-nums text-[#1B2038]`}
                        >
                          {baht(s.rentalFee)}
                        </td>
                        <td className={`${td} align-middle`}>
                          <div className="flex items-center gap-2">
                            <SpotFormButton mode="edit" spot={s} spots={sorted} />
                            <DeleteSpotButton
                              spotId={s._id}
                              spotNumber={s.spotNumber}
                              zone={s.zone}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
