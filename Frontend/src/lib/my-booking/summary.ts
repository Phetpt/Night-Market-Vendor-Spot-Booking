import type { Booking } from "@/types/booking"

export const DAILY_LIMIT = 3

// ตัด ISO เต็มให้เหลือ "YYYY-MM-DD" ; "2026-11-15T04:28:04.977Z" -> "2026-11-15"
const dateOf = (b: Booking) => b.bookingDate.slice(0, 10)//เอาตำแหน่ง 0-9

// แยกเป็น upcoming / past (today เป็น "YYYY-MM-DD" ตามเวลา Bangkok)
export function splitBookings(bookings: Booking[], today: string) {
  const upcoming = bookings
    .filter((b) => dateOf(b) >= today)
    .sort((a, b) => dateOf(a).localeCompare(dateOf(b)))

  const past = bookings
    .filter((b) => dateOf(b) < today)
    .sort((a, b) => dateOf(b).localeCompare(dateOf(a)))

  return { upcoming, past }
}

// ตัวเลขสำหรับการ์ดสรุป 3 ใบ (รับเฉพาะ upcoming ที่เรียงแล้ว)
export function summarize(upcoming: Booking[]) {
  const next = upcoming[0] ?? null
  const nextDate = next ? dateOf(next) : null
  const usedOnNextNight = nextDate
    ? upcoming.filter((b) => dateOf(b) === nextDate).length : 0 //ถ้ามี nextDate ให้กรองรายการที่ วันที่ตรงกัน แล้วนับด้วย .length ถ้าไม่มีก็เป็น 0

  const totalFees = upcoming.reduce((sum, b) => sum + b.spot.rentalFee, 0)

  return { count: upcoming.length, next, nextDate, usedOnNextNight, totalFees }
}