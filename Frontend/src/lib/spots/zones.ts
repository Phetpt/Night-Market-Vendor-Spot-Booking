import type { Spot } from "@/types/spot";
import { MAX_SPOTS_PER_ZONE } from "./validation";

type SpotLike = Pick<Spot, "spotNumber" | "zone">;

export type ZoneInfo = { code: string; name: string; count: number };

export type NextSpotNumber =
  | { ok: true; spotNumber: string }
  | { ok: false; reason: "full" };

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// "A05" -> "A"
export function zoneCodeOf(spotNumber: string): string {
  return spotNumber.trim().charAt(0).toUpperCase();
}

// สร้างรายการโซน (รหัส -> ชื่อ) จาก spot ที่มีอยู่
// ถ้ารหัสเดียวมีหลายชื่อ ใช้ชื่อที่พบมากสุด
export function deriveZones(spots: SpotLike[]): ZoneInfo[] {
  const byCode = new Map<string, Map<string, number>>();

  for (const spot of spots) {
    const code = zoneCodeOf(spot.spotNumber);
    if (!/^[A-Z]$/.test(code)) continue;
    const name = spot.zone.trim();
    const names = byCode.get(code) ?? new Map<string, number>();
    names.set(name, (names.get(name) ?? 0) + 1);
    byCode.set(code, names);
  }

  return [...byCode.entries()]
    .map(([code, names]) => {
      let bestName = "";
      let bestCount = 0;
      let total = 0;
      for (const [name, count] of names) {
        total += count;
        if (count > bestCount) {
          bestName = name;
          bestCount = count;
        }
      }
      return { code, name: bestName, count: total };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}

// เลขถัดไปของโซน = เลขสูงสุด + 1 
export function getNextSpotNumber(spots: SpotLike[], code: string): NextSpotNumber {
  const used = new Set<number>()
  for (const spot of spots) {
    const match = /^([A-Z])(\d+)$/.exec(spot.spotNumber.trim().toUpperCase());
    if (match && match[1] === code) used.add(Number(match[2]))
  }
  let next = 1;
  while (used.has(next)) next++
  if (next > MAX_SPOTS_PER_ZONE) return { ok: false, reason: "full" };
  return { ok: true, spotNumber: `${code}${String(next).padStart(2, "0")}` };
}

// ตัวอักษรที่ยังไม่มีโซนใช้
export function unusedZoneCodes(spots: SpotLike[]): string[] {
  const used = new Set(spots.map((s) => zoneCodeOf(s.spotNumber)));
  return LETTERS.filter((letter) => !used.has(letter));
}

// ชื่อโซนซ้ำกับของเดิมหรือไม่
export function zoneNameTaken(spots: SpotLike[], name: string): boolean {
  const target = name.trim().toLowerCase();
  return spots.some((s) => s.zone.trim().toLowerCase() === target);
}
