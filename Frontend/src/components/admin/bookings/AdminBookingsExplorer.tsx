"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CalendarDays, ChevronDown, Search, Ticket, Users, Wallet } from "lucide-react";
import type { Booking } from "@/types/booking";
import type { Spot } from "@/types/spot";
import EditBookingButton from "@/components/my-booking/edit-booking/EditBookingButton";
import CancelBookingButton from "@/components/my-booking/CancelBookingButton";
import { DAILY_LIMIT } from "@/lib/my-booking/summary";
import { formatCurrency } from "@/lib/spots/format"

type Props = { bookings: Booking[]; spots: Spot[]; today: string };

const PAGE_SIZE = 6;
const RETURN_TO = "/admin/bookings";

const dateOf = (b: Booking) => b.bookingDate.slice(0, 10)
const refOf = (b: Booking) => `#${b._id.slice(-8).toUpperCase()}`
const baht = formatCurrency

const fieldBase =
  "h-11 w-full rounded-xl border border-[#DDE3F2] bg-white text-sm text-[#1F2A44] outline-none focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2";
const selectClass = `${fieldBase} appearance-none pl-3 pr-9`;
const searchClass = `${fieldBase} pl-9 pr-3`;

const card = "rounded-2xl border border-[#DDE3F2] bg-white p-5";
const iconCircle =
  "flex size-10 items-center justify-center rounded-full bg-[#FFF4EC] text-[#8A3F1D]";
const th = "px-4 py-3";
const td = "px-4 py-3";

function formatDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

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

// select ที่วาง chevron เอง (chevron ของ native ขยับด้วย padding ไม่ได้)
function SelectBox({
  id,
  value,
  onChange,
  className = "",
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
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

export default function AdminBookingsExplorer({ bookings, spots, today }: Props) {
  const [night, setNight] = useState("all"); // "all" = ทุกคืน
  const [zone, setZone] = useState("all");
  const [member, setMember] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const nights = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of bookings) counts.set(dateOf(b), (counts.get(dateOf(b)) ?? 0) + 1);
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [bookings]);

  const zones = useMemo(() => [...new Set(bookings.map((b) => b.spot.zone))].sort(), [bookings]);

  const members = useMemo(() => {
    const m = new Map<string, string>();
    for (const b of bookings) m.set(b.user._id, b.user.name);
    return [...m.entries()].sort(([, a], [, b]) => a.localeCompare(b));
  }, [bookings]);

  // จำนวน booking ต่อคนต่อคืน (ใช้เช็กลิมิต 3 spot ตอน Edit/Cancel)
  const countsByUser = useMemo(() => {
    const m: Record<string, Record<string, number>> = {};
    for (const b of bookings) {
      const u = b.user._id;
      const d = dateOf(b);
      m[u] ??= {};
      m[u][d] = (m[u][d] ?? 0) + 1;
    }
    return m;
  }, [bookings]);

  // ชุดตามคืนที่เลือก (การ์ดสรุปคิดจากชุดนี้ ก่อนกรอง Search/Zone/Member)
  const nightRows = useMemo(
    () => (night === "all" ? bookings : bookings.filter((b) => dateOf(b) === night)),
    [bookings, night],
  );
  const totalFee = nightRows.reduce((s, b) => s + b.spot.rentalFee, 0);
  const zoneCount = new Set(nightRows.map((b) => b.spot.zone)).size;
  const memberCount = new Set(nightRows.map((b) => b.user._id)).size;

  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      nightRows
        .filter((b) => zone === "all" || b.spot.zone === zone)
        .filter((b) => member === "all" || b.user._id === member)
        .filter(
          (b) =>
            q === "" ||
            [
              b.user.name,
              b.user.tel,
              refOf(b),
              b.spot.spotNumber,
              b.spot.zone,
              b.productType,
            ].some((v) => String(v).toLowerCase().includes(q)),
        )
        .sort(
          (a, b) =>
            dateOf(a).localeCompare(dateOf(b)) ||
            a.spot.spotNumber.localeCompare(b.spot.spotNumber, undefined, { numeric: true }),
        ),
    [nightRows, zone, member, q],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const allNights = night === "all";
  const filtersActive = zone !== "all" || member !== "all" || q !== "";

  function clearFilters() {
    setZone("all");
    setMember("all");
    setQuery("");
    setPage(1);
  }

  return (
    <div className="space-y-6 px-6 py-8">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[#8A3F1D]">
          Admin workspace{" "}
          <span className="font-normal normal-case text-[#4A5470]">
            / Market season {today.slice(0, 4)}
          </span>
        </p>
        <h1 className="text-3xl font-bold text-[#1F2A44]">Upcoming bookings</h1>
        <p className="text-[#4A5470]">
          Find every upcoming reservation, contact a vendor and manage changes in one place.
        </p>
      </header>

      {/* Market night */}
      <div className="space-y-2 rounded-2xl border border-[#DDE3F2] bg-white p-5">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-[#8A3F1D]" />
          <label htmlFor="night" className="text-sm font-semibold text-[#1F2A44]">
            Market night
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <SelectBox
            id="night"
            value={night}
            onChange={(v) => {
              setNight(v);
              setPage(1);
            }}
            className="min-w-[220px]"
          >
            <option value="all">All market nights</option>
            {nights.map(([d, n]) => (
              <option key={d} value={d}>
                {formatDate(d)} ({n})
              </option>
            ))}
          </SelectBox>
          <p className="min-w-[200px] flex-1 text-sm text-[#4A5470]">
            {allNights
              ? "Showing every upcoming night. Pick a market night to see a single night only."
              : "Totals below apply to this market night only."}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          icon={<Ticket className="size-5" />}
          label={allNights ? "Confirmed bookings" : "Confirmed this night"}
          value={nightRows.length}
          sub={`Across ${zoneCount} ${zoneCount === 1 ? "zone" : "zones"}`}
        />
        <Stat
          icon={<Users className="size-5" />}
          label={allNights ? "Members" : "Members this night"}
          value={memberCount}
          sub={`Max ${DAILY_LIMIT} spots per member per night`}
        />
        <Stat
          icon={<Wallet className="size-5" />}
          label="Expected rental fees"
          value={baht(totalFee)}
          sub="Confirmed bookings only · not paid revenue"
          valueClass="text-[#A33900]"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-[#DDE3F2] bg-white p-5">
        <div className="min-w-[240px] flex-[2]">
          <label htmlFor="search" className="mb-1 block text-sm font-semibold text-[#1F2A44]">
            Search
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#4A5470]"
            />
            <input
              id="search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Name, phone, ref, spot or product"
              className={searchClass}
            />
          </div>
        </div>
        <div className="min-w-[200px] flex-1">
          <label htmlFor="member" className="mb-1 block text-sm font-semibold text-[#1F2A44]">
            Member
          </label>
          <SelectBox
            id="member"
            value={member}
            onChange={(v) => {
              setMember(v);
              setPage(1);
            }}
          >
            <option value="all">All members</option>
            {members.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </SelectBox>
        </div>
        <div className="min-w-[200px] flex-1">
          <label htmlFor="zone" className="mb-1 block text-sm font-semibold text-[#1F2A44]">
            Zone
          </label>
          <SelectBox
            id="zone"
            value={zone}
            onChange={(v) => {
              setZone(v);
              setPage(1);
            }}
          >
            <option value="all">All zones</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
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

      {/* Reservations: หัวข้อ + ตาราง + pagination อยู่ในการ์ดใบเดียว */}
      <section className={card}>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-[#1F2A44]">
            Reservations · {allNights ? "All upcoming nights" : formatDate(night)}
          </h2>
          <span className="text-sm text-[#4A5470]">{filtered.length} total</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl bg-[#EFF4FF] p-8 text-center text-sm text-[#4A5470]">
            <p className="font-bold text-[#1F2A44]">No bookings found</p>
            <p className="mt-1">
              {filtersActive
                ? "No bookings match your filters. Try clearing them."
                : allNights
                  ? "Upcoming bookings will appear here."
                  : "There are no bookings for this night."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-[#EFF4FF] text-xs font-bold uppercase tracking-wide text-[#4A5470]">
                <tr>
                  <th className={`${th} rounded-l-xl`}>Booking ref</th>
                  <th className={th}>Night</th>
                  <th className={th}>Member</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Spot</th>
                  <th className={th}>Product category</th>
                  <th className={th}>Rental fee</th>
                  <th className={`${th} rounded-r-xl`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((b) => (
                  <tr key={b._id} className="border-b border-[#DDE3F2] last:border-b-0">
                    <td className={`${td} text-[#4A5470]`}>{refOf(b)}</td>
                    <td className={`${td} whitespace-nowrap font-semibold text-[#1B2038]`}>
                      {formatDate(dateOf(b))}
                    </td>
                    <td className={`${td} font-semibold text-[#1B2038]`}>{b.user.name}</td>
                    <td className={`${td} text-[#1B2038]`}>{b.user.tel}</td>
                    <td className={`${td} text-[#1B2038]`}>
                      {b.spot.spotNumber}
                      <span className="ml-1 text-[#4A5470]">· {b.spot.zone}</span>
                    </td>
                    <td className={`${td} text-[#4A5470]`}>{b.productType}</td>
                    <td className={`${td} font-semibold text-[#A33900]`}>
                      {baht(b.spot.rentalFee)}
                    </td>
                    <td className={td}>
                      <div className="flex gap-2">
                        <EditBookingButton
                          booking={b}
                          today={today}
                          nightCounts={countsByUser[b.user._id] ?? {}}
                          dailyLimit={DAILY_LIMIT}
                          returnTo={RETURN_TO}
                          spots={spots}
                          compact
                        />
                        <CancelBookingButton
                          bookingId={b._id}
                          spotNumber={b.spot.spotNumber}
                          zone={b.spot.zone}
                          productType={b.productType}
                          bookingRef={refOf(b)}
                          fee={b.spot.rentalFee}
                          dateLabel={formatDate(dateOf(b))}
                          shortDate={formatDate(dateOf(b))}
                          usedOnNight={countsByUser[b.user._id]?.[dateOf(b)] ?? 1}
                          dailyLimit={DAILY_LIMIT}
                          memberName={b.user.name}
                          returnTo={RETURN_TO}
                          compact
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#4A5470]">
              Showing {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length} {filtered.length === 1 ? "booking" : "bookings"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage === 1}
                className="rounded-xl border border-[#DDE3F2] bg-white px-3 py-2 text-sm font-semibold text-[#1B2038] hover:bg-[#FFF4EC] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === safePage ? "page" : undefined}
                  className={`size-9 rounded-xl text-sm font-semibold focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2 ${
                    n === safePage
                      ? "border border-[#1B2038] bg-[#1B2038] text-white"
                      : "border border-[#DDE3F2] bg-white text-[#1B2038] hover:bg-[#FFF4EC]"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(safePage + 1)}
                disabled={safePage === totalPages}
                className="rounded-xl border border-[#DDE3F2] bg-white px-3 py-2 text-sm font-semibold text-[#1B2038] hover:bg-[#FFF4EC] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
