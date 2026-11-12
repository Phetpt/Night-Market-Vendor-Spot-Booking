import "server-only"

// ดึงค่า env ถ้าไม่มีให้ error บอกชื่อตัวแปรที่ขาด
function required(name: string) {
  const value = process.env[name]
  if(!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

export const env = {
  
  // URL ของ Backend (ตัด / ท้ายออก)
  API_URL: required("API_URL").replace(/\/$/, ""),
  // secret สำหรับเซ็น session ของ NextAuth
  NEXTAUTH_SECRET: required("NEXTAUTH_SECRET"),
}