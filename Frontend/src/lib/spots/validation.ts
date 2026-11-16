// กฎตรวจสอบข้อมูล spot ใช้ร่วมกันทั้งฟอร์ม (client) และ server action

export const SPOT_NUMBER_PATTERN = /^[A-Z]\d{2}$/;
export const ZONE_CODE_PATTERN = /^[A-Z]$/;
export const MAX_SPOTS_PER_ZONE = 99;

export const SIZE_MIN = 0.5;
export const SIZE_MAX = 50;
export const FEE_MAX = 100_000;
export const LOCATION_MAX = 100;
export const ZONE_NAME_MIN = 2;
export const ZONE_NAME_MAX = 30;

// ยุบช่องว่างซ้ำและตัดหัวท้าย
export function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

// ให้เหลือเฉพาะตัวเลขและจุดทศนิยมไม่เกิน 1 จุด ตัดทศนิยมเกิน
export function sanitizeDecimal(raw: string, maxDecimals: number): string {
  const out = raw.replace(/[^\d.]/g, "");
  const dot = out.indexOf(".");
  if (dot === -1) return out;
  const intPart = out.slice(0, dot);
  const fraction = out.slice(dot + 1).replace(/\./g, "").slice(0, maxDecimals);
  return `${intPart}.${fraction}`;
}

// "2.5" -> 2.5, ค่าที่ไม่ใช่ตัวเลขล้วน -> null
export function parseDecimal(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

export function validateDimension(raw: string, label: string): string | null {
  if (raw.trim() === "") return `${label} is required`;
  const n = parseDecimal(raw);
  if (n === null) return `${label} must be a number`;
  if (n < SIZE_MIN || n > SIZE_MAX) {
    return `${label} must be between ${SIZE_MIN} and ${SIZE_MAX} m`;
  }
  return null;
}

export function validateFee(raw: string): string | null {
  const text = raw.trim();
  if (text === "") return "Rental fee is required";
  // ตัวเลข ทศนิยมไม่เกิน 2 ตำแหน่ง 
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return "Enter a number with up to 2 decimals";
  const n = Number(text);
  if (n <= 0) return "Rental fee must be more than 0";
  if (n > FEE_MAX) return `Rental fee can't exceed ${FEE_MAX.toLocaleString("en-US")}`;
  return null;
}

export function validateLocation(raw: string): string | null {
  const text = cleanText(raw);
  if (text === "") return "Location is required";
  if (text.length > LOCATION_MAX) return `Location must be ${LOCATION_MAX} characters or fewer`;
  return null;
}

export function validateZoneName(raw: string): string | null {
  const text = cleanText(raw);
  if (text.length < ZONE_NAME_MIN) return `Zone name needs at least ${ZONE_NAME_MIN} characters`;
  if (text.length > ZONE_NAME_MAX) return `Zone name must be ${ZONE_NAME_MAX} characters or fewer`;
  return null;
}
