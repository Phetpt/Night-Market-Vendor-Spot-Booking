import SpotsExpolorer from "@/components/spots/SpotsExplorer"
import { listSpots } from "@/lib/api/spots"
import { getBookedSpotIds, listBookings } from "@/lib/api/bookings"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"


type Props = {
  searchParams: Promise<{ date?: string }>
}

// ตรวจว่าเป็นวันที่จริงในรูป YYYY-MM-DD (กันทั้งรูปแบบผิดและวันที่ที่ไม่มีจริง)
function isValidDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

export default async function Spots({ searchParams }: Props) {
  const { date } = await searchParams

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" })

  // ใช้ค่าจาก URL เมื่อรูปแบบถูกและไม่ใช่วันที่ผ่านมาแล้ว ไม่งั้นใช้วันนี้
  const selectedDate = date && isValidDate(date) && date >= today ? date : today

  const [{ spots }, bookedSpotIds] = await Promise.all([
    listSpots(),
    getBookedSpotIds(selectedDate),
  ])

  const session = await getServerSession(authOptions)

  let myBookedSpotIds: string[] = []

  if (session) {
    try {
      const { bookings } = await listBookings(session.accessToken)

      myBookedSpotIds = bookings
        .filter(
          (b) =>
            b.user._id === session.user.id &&
            b.bookingDate.slice(0, 10) === selectedDate
        )
        .map((b) => b.spot._id)
    } catch (error) {
      console.error("could not load my bookings", error)
    }
  }


  return (
    <SpotsExpolorer
      key={selectedDate}
      spots={spots}
      bookedSpotIds={bookedSpotIds}
      myBookedSpotIds={myBookedSpotIds}
      selectedDate={selectedDate}
      today={today}
    />
  )
}