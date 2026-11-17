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

| Layer | Technology |
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
│   ├── config/             # db.js and config.env (not committed)
│   ├── controllers/        # request handlers and business rules
│   ├── middleware/
│   ├── models/             # User, Spot, Booking
│   ├── routes/             # auth, spots, bookings
│   └── server.js
└── Frontend/               # Next.js app
    └── src/
        ├── app/
        │   ├── (auth)/         # login / register
        │   ├── (public)/       # public pages
        │   ├── admin/          # bookings, spots
        │   ├── my-booking/
        │   └── api/            # NextAuth
        └── components/         # admin, auth, home, my-booking, spots, ui
```

For more details on each part, see [Backend/README.md](Backend/README.md) and [Frontend/README.md](Frontend/README.md).


## Scripts

**Backend**

| Command | Description |
|---|---|
| `npm run dev` | Run with nodemon |
| `npm start` | Run in production |
| `npm test` | Only checks the syntax of `server.js` (`node --check`); there is no real test suite yet |

**Frontend**

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with TypeScript |

## API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Register a new user |
| POST | `/auth/login` | public | Log in |
| GET | `/auth/me` | login | Get the current user |
| GET | `/auth/logout` | login | Log out |
| GET | `/spots` | public | List spots |
| GET | `/spots/:id` | public | Get spot details |
| POST | `/spots` | admin | Create a spot |
| PUT | `/spots/:id` | admin | Update a spot |
| DELETE | `/spots/:id` | admin | Delete a spot (soft delete) |
| GET | `/bookings/availability` | public | Check available dates |
| GET | `/bookings` | login | List bookings (members see their own, admins see all) |
| GET | `/bookings/:id` | login | Get booking details |
| POST | `/bookings` | member | Create a booking |
| PUT | `/bookings/:id` | owner / admin | Update a booking |
| DELETE | `/bookings/:id` | owner / admin | Delete a booking |

For full details on every endpoint, see Swagger UI at `/api-docs`.
