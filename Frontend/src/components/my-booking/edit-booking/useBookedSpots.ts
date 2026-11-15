import { useEffect, useState } from "react"

import { getBookedSpots } from "@/lib/my-booking/actions"

// โหลดรายการ spot id ที่ถูกจองในวัน ใหม่ทุกครั้งที่วันเปลี่ยน
// คืน null ถ้ายังไม่โหลด/โหลดไม่ได้ 
export function useBookedSpots(date: string, enabled: boolean): Set<string> | null {
  const [booked, setBooked] = useState<Set<string> | null>(null)

  useEffect(() => {
    if (!enabled || !date) return
    let cancelled = false
    getBookedSpots(date).then((ids) => {
      if (!cancelled) setBooked(ids ? new Set(ids) : null)
    })
    return () => {
      cancelled = true
    }
  }, [enabled, date])

  return booked
}
