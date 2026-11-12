/**
 * คืนค่า path ภายในเว็บที่ปลอดภัยสำหรับ redirect หลัง login
 * ยอมรับเฉพาะ path ที่ขึ้นต้นด้วย "/" ตัวเดียว (เช่น /my-booking)
 * กัน open redirect: "//evil.com", "/\evil.com", "https://evil.com", "javascript:..."
 */
export function getSafeCallbackUrl(
  raw: string | null | undefined,
  fallback = "/"
): string {
  if (!raw) return fallback
  if (!raw.startsWith("/")) return fallback // ต้องเป็น path ภายใน ไม่ใช่ absolute URL
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback // protocol-relative
  if (/[\\\u0000-\u001f]/.test(raw)) return fallback // backslash / control chars ที่เบราว์เซอร์ตีความเป็น "/"
  return raw
}
