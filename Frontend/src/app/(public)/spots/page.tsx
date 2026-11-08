import SpotsExpolorer from "@/components/spots/SpotsExplorer"
import { listSpots } from "@/lib/api/spots"
import { getBookedSpotIds } from "@/lib/api/bookings"


export default async function Spots() {
  const selectedDate = "2026-11-08"

  const [{spots}, bookedSpotIds] = await Promise.all([
    listSpots(),
    getBookedSpotIds(selectedDate)
  ])

  return (
    <SpotsExpolorer spots={spots} bookedSpotIds={bookedSpotIds}/>
  )
}

/*
type Props = {
  searchParams: Promise<{ date?: string }>
}
*/


/*
const { date } = await searchParams
  const selectedDate = date ?? new Date().toISOString().slice(0, 10)

  // ยิง 2 คำขอพร้อมกัน ไม่ต้องรอทีละอัน
  const [{ spots, count }, bookedSpotIds] = await Promise.all([
    listSpots(),
    getBookedSpotIds(selectedDate),
  ])

  // { A: Spot[], B: Spot[], ... }
  const byZone = Object.groupBy(spots, (spot) => spot.zone)

  // เรียงโซนตาม spotNumber ตัวแรกของแต่ละโซน (A, B, C, ...) แทนการเรียงชื่อ zone ตรงๆ
  const zones = Object.keys(byZone).sort((a, b) => {
    const firstA = byZone[a]![0].spotNumber
    const firstB = byZone[b]![0].spotNumber
    return firstA.localeCompare(firstB, undefined, { numeric: true })
  })
*/

/*
<section className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Vendor spots ({count})</h1>
      <p className="mt-1 text-slate-600">Showing availability for {selectedDate}</p>

      {zones.map((zone) => (
        <div key={zone} className="mt-6">
          <h2 className="text-xl font-semibold">Zone {zone}</h2>
          <ul className="mt-2 space-y-2">
            {byZone[zone]!.map((spot) => {
              const isBooked = bookedSpotIds.includes(spot._id)
              return (
                <li key={spot._id} className="flex items-center justify-between border rounded-lg p-3">
                  <span className={isBooked ? "text-slate-400 line-through" : ""}>
                    {spot.spotNumber} · ฿{spot.rentalFee}
                  </span>
                  {isBooked && (
                    <span className="text-xs font-semibold text-slate-500">Booked</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
*/