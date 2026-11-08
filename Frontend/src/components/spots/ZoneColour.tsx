 export function zoneColor(zone: string) {
  let hash = 0
  for (const char of zone) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360
  }
  return `hsl(${hash} 55% 40%)`
}