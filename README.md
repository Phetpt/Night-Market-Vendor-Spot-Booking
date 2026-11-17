# Night Market Vendor Spot Booking

เว็บแอปจองล็อกขายของสำหรับตลาดนัดกลางคืน พ่อค้าแม่ค้า (member) ดูล็อกว่าง เลือกวันที่ และจองล็อกที่ต้องการได้ ส่วนแอดมินจัดการล็อกและการจองทั้งหมดได้

## Features

**สมาชิก (Member)**
- สมัครสมาชิก / เข้าสู่ระบบ
- ดูรายการล็อกและตรวจสอบวันที่ว่าง
- จองล็อกตามวันที่ พร้อมระบุประเภทสินค้าที่จะขาย
- ดู แก้ไข และยกเลิกการจองของตัวเอง (หน้า My Booking)

**แอดมิน (Admin)**
- เพิ่ม แก้ไข ลบล็อก (soft delete) พร้อมกำหนดโซน ขนาด ค่าเช่า
- ระบบสร้างเลขล็อกอัตโนมัติ
- ดู แก้ไข ลบการจองของสมาชิกทุกคน

**กฎการจอง**
- 1 ล็อก จองได้ 1 คนต่อวัน
- สมาชิกจองได้สูงสุด 3 ล็อกต่อวัน

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Redux Toolkit, NextAuth |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| Auth | JWT (bearer token), bcryptjs, role-based access (`admin` / `member`) |
| Security | helmet, hpp, cors, express-rate-limit |
| API Docs | Swagger UI |

## Project Structure

```
.
├── Backend/                # REST API (Express + MongoDB)
│   ├── config/             # db.js และ config.env (ไม่ commit)
│   ├── controllers/        # request handlers และ business rules
│   ├── middleware/
│   ├── models/             # User, Spot, Booking
│   ├── routes/             # auth, spots, bookings
│   └── server.js
└── Frontend/               # Next.js app
    └── src/
        ├── app/
        │   ├── (auth)/         # login / register
        │   ├── (public)/       # หน้าสาธารณะ
        │   ├── admin/          # bookings, spots
        │   ├── my-booking/
        │   └── api/            # NextAuth
        └── components/         # admin, auth, home, my-booking, spots, ui
```

รายละเอียดเพิ่มเติมของแต่ละส่วน: [Backend/README.md](Backend/README.md) · [Frontend/README.md](Frontend/README.md)

## Environment Variables

### Backend (`Backend/config/config.env`)

| ตัวแปร | คำอธิบาย |
|---|---|
| `NODE_ENV` | `development` หรือ `production` |
| `PORT` | พอร์ตของ API (ค่าเริ่มต้น 5000) |
| `MONGO_URI` | connection string ของ MongoDB |
| `JWT_SECRET` | secret สำหรับเซ็น JWT |
| `JWT_COOKIE_EXPIRE` | อายุ cookie (วัน) |
| `FRONTEND_URL` | origin ของ Frontend สำหรับ CORS |

### Frontend (`Frontend/.env.local`)

| ตัวแปร | คำอธิบาย |
|---|---|
| `API_URL` | URL ของ Backend (ไม่ต้องมี `/api/v1` ต่อท้าย) |
| `NEXTAUTH_URL` | URL ของ Frontend |
| `NEXTAUTH_SECRET` | secret สำหรับ NextAuth |

## Scripts

**Backend**

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รันด้วย nodemon |
| `npm start` | รัน production |
| `npm test` | ตรวจ syntax ของ `server.js` เท่านั้น (`node --check`) ยังไม่มีชุดทดสอบจริง |

**Frontend**

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รัน dev server |
| `npm run build` | build production |
| `npm start` | รัน production build |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |
| `npm run typecheck` | ตรวจ type ด้วย TypeScript |

## API Overview

| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| POST | `/auth/register` | public | สมัครสมาชิก |
| POST | `/auth/login` | public | เข้าสู่ระบบ |
| GET | `/auth/me` | login | ข้อมูลผู้ใช้ปัจจุบัน |
| GET | `/auth/logout` | login | ออกจากระบบ |
| GET | `/spots` | public | รายการล็อก |
| GET | `/spots/:id` | public | รายละเอียดล็อก |
| POST | `/spots` | admin | เพิ่มล็อก |
| PUT | `/spots/:id` | admin | แก้ไขล็อก |
| DELETE | `/spots/:id` | admin | ลบล็อก (soft delete) |
| GET | `/bookings/availability` | public | ตรวจสอบวันที่ว่าง |
| GET | `/bookings` | login | ดูการจอง (member เห็นของตัวเอง, admin เห็นทั้งหมด) |
| GET | `/bookings/:id` | login | รายละเอียดการจอง |
| POST | `/bookings` | member | สร้างการจอง |
| PUT | `/bookings/:id` | เจ้าของ / admin | แก้ไขการจอง |
| DELETE | `/bookings/:id` | เจ้าของ / admin | ลบการจอง |

รายละเอียดครบทุก endpoint ดูได้ที่ Swagger UI (`/api-docs`)

