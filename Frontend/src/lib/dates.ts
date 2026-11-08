
export function getDays(center: string, count: number): string[] {
  const half = Math.floor(count / 2)

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(`${center}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + (i - half))
    return d.toISOString().slice(0, 10)
  })
}