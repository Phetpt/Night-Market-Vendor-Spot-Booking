export type RegisterFormValues = {
  name: string
  email: string
  tel: string
  password: string
  confirmPassword: string
}

// เก็บข้อความ error ของแต่ละช่องในฟอร์ม T (ช่องไหนไม่ผิดก็ไม่ต้องใส่)
export type FieldErrors<T> = Partial<Record<keyof T, string>>

// ผลลัพธ์: ผ่าน → ได้ data ที่ "สะอาดแล้ว" / ไม่ผ่าน → ได้ errors
export type ValidationResult<TOut, TIn> =
  | { ok: true; data: TOut }
  | { ok: false; errors: FieldErrors<TIn> }

//rules
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const THAI_MOBILE_RE = /^0[689]\d{8}$/
export const PASSWORD_MIN = 6

// ตัด "-" และเว้นวรรค แล้วแปลง +66 เป็น 0 → ได้ 0812345678
export function normalizeTel(raw: string) {
  const v = raw.trim().replace(/[\s-]/g, "")
  return v.startsWith("+66") ? "0" + v.slice(3) : v
}

// จัดรูปแบบสำหรับแสดงในช่อง input: เหลือแต่ตัวเลข ไม่เกิน 10 ตัว แล้วใส่ขีดเป็น
export function formatTel(raw: string) {
  const digits = normalizeTel(raw).replace(/\D/g, "").slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

// ---------- ฟังก์ชันตรวจ ----------
export function validateRegister(input: RegisterFormValues): ValidationResult<{ name: string; email: string; tel: string; password: string }, RegisterFormValues> {
  const errors: FieldErrors<RegisterFormValues> = {}

  const name = input.name.trim()
  if (!name) errors.name = "Please enter your name"

  const email = input.email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email"

  const tel = normalizeTel(input.tel)
  if (!THAI_MOBILE_RE.test(tel)) {
    errors.tel = "Please enter a valid Thai mobile number (e.g. 081-234-5678)"
  }

  if (input.password.length < PASSWORD_MIN) {
    errors.password = `Password must be at least ${PASSWORD_MIN} characters`
  }

  if (!input.confirmPassword) {
    errors.confirmPassword = "Please confirm your password"
  } else if (input.password !== input.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  // data ที่คืน = เฉพาะที่ Backend ต้องการ (ไม่มี confirmPassword, ไม่มี role)
  return { ok: true, data: { name, email, tel, password: input.password } }
}

export type LoginFormValues = { email: string; password: string }

export function validateLogin(
  input: LoginFormValues,
): ValidationResult<{ email: string; password: string }, LoginFormValues> {
  const errors: FieldErrors<LoginFormValues> = {}
  const email = input.email.trim().toLowerCase()
  if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email"
  if (!input.password) errors.password = "Please enter your password"
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, data: { email, password: input.password } }
}
