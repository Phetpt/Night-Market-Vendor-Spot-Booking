// แปลงและแสดงผล size / ค่าเช่า ให้เหมือนกันทุกหน้า

// รับ "2 x 2 m", "3x3", "3 x 3", "2*2", "2×2" (หน่วย m ไม่บังคับ)
const SIZE_PATTERN = /^\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(?:m)?\s*$/i;

export type SpotDimensions = { width: number; depth: number };

export function parseSpotSize(raw: string): SpotDimensions | null {
  const match = SIZE_PATTERN.exec(raw ?? "");
  if (!match) return null;
  const width = Number(match[1]);
  const depth = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(depth)) return null;
  return { width, depth };
}

// รูปแบบมาตรฐานที่จะเก็บลง DB
export function buildSpotSize(width: number, depth: number): string {
  return `${width} x ${depth} m`;
}

// ใช้แสดงผล: ข้อมูลเก่า/ใหม่ออกมาเป็นรูปแบบเดียว 
export function formatSpotSize(raw: string): string {
  const dims = parseSpotSize(raw);
  return dims ? buildSpotSize(dims.width, dims.depth) : (raw ?? "").trim();
}

// ใช้เติมช่องกว้าง/ลึกตอน Edit 
export function sizeToFields(raw: string): { width: string; depth: string } {
  const dims = parseSpotSize(raw);
  return dims
    ? { width: String(dims.width), depth: String(dims.depth) }
    : { width: "", depth: "" };
}

// พื้นที่ ใช้เรียงตัวเลือกขนาด 
export function sizeArea(raw: string): number {
  const dims = parseSpotSize(raw);
  return dims ? dims.width * dims.depth : Number.POSITIVE_INFINITY;
}

// ฿300 (จำนวนเต็ม) หรือ ฿300.50 (มีสตางค์)
export function formatCurrency(amount: number): string {
  const hasSatang = Math.round(amount * 100) % 100 !== 0;
  return `฿${amount.toLocaleString("en-US", {
    minimumFractionDigits: hasSatang ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
