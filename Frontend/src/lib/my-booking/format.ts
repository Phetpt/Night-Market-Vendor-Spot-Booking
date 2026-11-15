// "2026-11-15" -> "Sun, 15 Nov 2026"
export function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

// นับจำนวนวันจาก today ถึง date (ทั้งสองเป็น "YYYY-MM-DD")
export function daysUntil(date: string, today: string) {
  const ms =
    new Date(`${date}T00:00:00Z`).getTime() -
    new Date(`${today}T00:00:00Z`).getTime()
  return Math.round(ms / 86_400_000)
}

// จำนวนวัน -> ข้อความสั้นๆ
export function relativeLabel(days: number) {
  if (days === 0) return "Tonight"
  if (days === 1) return "Tomorrow"
  if (days < 14) return `In ${days} days`
  return `In ${Math.round(days / 7)} weeks`
}