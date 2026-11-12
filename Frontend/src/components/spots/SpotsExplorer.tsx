'use client'

import { useState } from "react"
import type { Spot, SpotStatus } from "@/types/spot"
import BookingRules from "./BookingRules"
import DateStrip from "./DateStrip"
import ZoneTabs from "./ZoneTabs"
import SpotGrid from "./SpotGrid"
import SelectionPanel from "./SelectionPanel"
import { bookSpots, type BookingResult } from "@/app/actions/bookings"
import { MAX_PER_DAY } from "@/config/booking"

type Props = {
  spots: Spot[]
  bookedSpotIds: string[],
  myBookedSpotIds: string[]
  selectedDate: string
  today: string
  isLoggedIn: boolean
}

export default function SpotsExplorer({ spots, bookedSpotIds, selectedDate, today, myBookedSpotIds, isLoggedIn }: Props) {
  // ---------- State ----------
  const [selectedIds, setSelectedIds] = useState<string[]>([]) // array เพราะผู้ใช้เลือกได้หลายช่อง
  const [activeZone, setActiveZone] = useState<string>("all")
  const [productTypes, setProductTypes] = useState<Record<string, string>>({})

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [results, setResults] = useState<BookingResult[]>([])

  const [justBookedIds, setJustBookedIds] = useState<string[]>([])

  // ---------- Derived data ----------
  const sortedSpots = [...spots].sort((a, b) => a.spotNumber.localeCompare(b.spotNumber))//เรียนตาม A, B, C,...
  const zones = ["all", ...new Set(sortedSpots.map((spot) => spot.zone))]

  const filteredSpots =
    activeZone === "all" ? spots : spots.filter((spot) => spot.zone === activeZone)

  const selectedSpots = spots.filter((spot) => selectedIds.includes(spot._id))

  // จำนวนช่องต่อโซน (แสดงบนแท็บ)
  const counts: Record<string, number> = { all: spots.length }
  for (const spot of spots) {
    counts[spot.zone] = (counts[spot.zone] ?? 0) + 1
  }

  const bookedCount = spots.filter((spot) => bookedSpotIds.includes(spot._id)).length
  const openCount = spots.length - bookedCount

  const resultLines = results.map((r) => ({
  ...r,
  label: spots.find((s) => s._id === r.spotId)?.spotNumber ?? "Unknown spot",
}))
  const myIds = [...new Set([...myBookedSpotIds, ...justBookedIds])]

  // ---------- Handlers ----------
  // คำนวณสถานะของแต่ละช่อง ลำดับความสำคัญ: ypurs > booked > selected > limit > available
  function statusOf(spot: Spot): SpotStatus {
    if (myIds.includes(spot._id)) return "yours"
    if (bookedSpotIds.includes(spot._id)) return "booked"
    if (selectedIds.includes(spot._id)) return "selected"                           
    if (myIds.length + selectedIds.length >= MAX_PER_DAY) return "limit"         
    return "available"
  }

  // เลือกอยู่แล้ว → เอาออก, ยังไม่เลือก → เพิ่มเข้า
  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }
  // เก็บข้อความ productType ของช่องที่ระบุ
  function updateProductType(id: string, value: string) {
    setProductTypes((prev) => ({...prev, [id]: value}))
  }

  async function handleConfirm() {
  if (isSubmitting) return
  setIsSubmitting(true)
  setResults([])

  const items = selectedSpots.map((spot) => ({
    spotId: spot._id,
    productType: productTypes[spot._id] ?? "",
  }))

  try {
  const res = await bookSpots(selectedDate, items)
  setResults(res)

  const okIds = res.filter((r) => r.ok).map((r) => r.spotId)
  setSelectedIds((prev) => prev.filter((id) => !okIds.includes(id)))
  setJustBookedIds((prev) => [...prev, ...okIds])

  setProductTypes((prev) => {
    const next = { ...prev }
    for (const id of okIds) delete next[id]
    return next
  })
  } catch {
    setResults(
      items.map((item) => ({
        spotId: item.spotId,
        ok: false,
        error: "Network error, please try again",
      }))
    )
  } finally {
    setIsSubmitting(false)
  }
}

  // ---------- Render ----------
  return (
    <main className="px-6 py-8 space-y-6">
      {/* Header + เลือกวันที่ */}
      <div>
        <h1 className="font-bold text-3xl text-[#1F2A44]">Pick a spot for your night</h1>
        <h2 className="text-[#4A5470]">
          Choose a date to see what&apos;s open. Anyone can browse, and you log in when
          you&apos;re ready to book.
        </h2>
        <DateStrip value={selectedDate} today={today} />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6 items-start">
        {/* ซ้าย: ตัวกรองโซน + ผังช่อง */}
        <section className="space-y-4">
          <ZoneTabs
            zones={zones}
            active={activeZone}
            onChange={setActiveZone}
            counts={counts}
            openCount={openCount}
            bookCount={bookedCount}
          />
          <SpotGrid spots={filteredSpots} statusOf={statusOf} onToggle={toggle} />
        </section>

        {/* ขวา: สรุปที่เลือก + กติกา (sticky ตามการเลื่อน) */}
        <aside className="sticky top-6 space-y-4">
          <SelectionPanel
            selectedSpots={selectedSpots}
            onRemove={toggle}
            onConfirm={handleConfirm}
            maxSpots={MAX_PER_DAY}
            productTypes={productTypes}
            onProductTypeChange={updateProductType}
            alreadyBookedCount={myIds.length}
            isSubmitting={isSubmitting}
            results={resultLines}
            isLoggedIn={isLoggedIn}
            
          />
          <BookingRules />
        </aside>
      </div>
    </main>
  )
}
