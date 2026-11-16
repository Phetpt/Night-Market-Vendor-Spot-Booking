"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { createSpot, updateSpot, deleteSpot, listSpots } from "@/lib/api/spots";
import type { ActionResult } from "@/lib/my-booking/messages";
import { buildSpotSize } from "@/lib/spots/format";
import { ZONE_CODE_PATTERN, cleanText, validateDimension, validateFee, validateLocation, validateZoneName } from "@/lib/spots/validation";
import { deriveZones, getNextSpotNumber, zoneNameTaken } from "@/lib/spots/zones";
import { spotErrors, spotMessage } from "./messages";

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

type SaveSpotInput = {
  id?: string; // มี id = แก้ไข, ไม่มี = สร้างใหม่
  zoneCode?: string; // ใช้ตอนสร้าง: รหัสโซน (A-Z)
  newZoneName?: string; // ใช้ตอนสร้างโซนใหม่เท่านั้น
  width: string;
  depth: string;
  locationDescription: string;
  rentalFee: string;
};

export type SaveSpotResult =
  | { ok: true; spotNumber?: string }
  | { ok: false; message: string };

function statusOf(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null && "status" in err) {
    const s = (err as { status: unknown }).status;
    return typeof s === "number" ? s : undefined;
  }
  return undefined;
}

function revalidateSpotPages() {
  revalidatePath("/admin/spots");
  revalidatePath("/spots");
}

export async function saveSpot(input: SaveSpotInput): Promise<SaveSpotResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, message: spotMessage(401) };
  if (session.user.role !== "admin") return { ok: false, message: spotMessage(403) };

  // ---- ตรวจฟิลด์ที่ใช้ทั้งตอนสร้างและแก้ไข ----
  const location = cleanText(input.locationDescription ?? "");
  const firstError =
    validateDimension(input.width ?? "", "Width") ??
    validateDimension(input.depth ?? "", "Depth") ??
    validateFee(input.rentalFee ?? "") ??
    validateLocation(location);
  if (firstError) return { ok: false, message: firstError };

  const common = {
    spotSize: buildSpotSize(Number(input.width), Number(input.depth)),
    locationDescription: location,
    rentalFee: Number(input.rentalFee),
  };

  // แก้ไข: ส่งแค่ 3 ฟิลด์ ไม่แตะ spotNumber / zone
  if (input.id) {
    if (!OBJECT_ID.test(input.id)) return { ok: false, message: spotMessage(404) };
    try {
      await updateSpot(input.id, common, session.accessToken);
    } catch (err) {
      return { ok: false, message: spotMessage(statusOf(err)) };
    }
    revalidateSpotPages();
    return { ok: true };
  }

  // สร้างใหม่
  const code = (input.zoneCode ?? "").trim().toUpperCase();
  if (!ZONE_CODE_PATTERN.test(code)) {
    return { ok: false, message: spotErrors.zoneRequired };
  }

  // ดึงรายการล่าสุด แล้วคำนวณจากข้อมูลนี้ 
  let spots;
  try {
    spots = (await listSpots()).spots;
  } catch (err) {
    return { ok: false, message: spotMessage(statusOf(err)) };
  }

  const existingZone = deriveZones(spots).find((z) => z.code === code);
  let zoneName: string;
  if (existingZone) {
    zoneName = existingZone.name;
  } else {
    zoneName = cleanText(input.newZoneName ?? "");
    const nameError = validateZoneName(zoneName);
    if (nameError) return { ok: false, message: nameError };
    if (zoneNameTaken(spots, zoneName)) {
      return { ok: false, message: spotErrors.zoneNameTaken(zoneName) };
    }
  }

  const next = getNextSpotNumber(spots, code);
  if (!next.ok) return { ok: false, message: spotErrors.zoneFull(code) };

  try {
    await createSpot(
      { spotNumber: next.spotNumber, zone: zoneName, ...common },
      session.accessToken,
    );
  } catch (err) {
    return { ok: false, message: spotMessage(statusOf(err)) };
  }

  // ตรวจซ้ำหลังบันทึก
  try {
    const after = (await listSpots()).spots;
    const copies = after.filter((s) => s.spotNumber === next.spotNumber).length;
    if (copies > 1) {
      revalidateSpotPages();
      return { ok: false, message: spotErrors.duplicateSuspected(next.spotNumber) };
    }
  } catch {
    // ตรวจซ้ำไม่ได้ก็ไม่ถือว่าล้มเหลว เพราะ spot ถูกสร้างแล้ว
  }

  revalidateSpotPages();
  return { ok: true, spotNumber: next.spotNumber };
}

export async function removeSpot(spotId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, message: spotMessage(401) };
  if (session.user.role !== "admin") return { ok: false, message: spotMessage(403) };
  if (!OBJECT_ID.test(spotId)) return { ok: false, message: spotMessage(404) };

  try {
    await deleteSpot(spotId, session.accessToken);
  } catch (err) {
    // 404 = ถูกปิดไปแล้ว ถือว่าสำเร็จ
    if (statusOf(err) !== 404) {
      return { ok: false, message: spotMessage(statusOf(err)) };
    }
  }

  revalidatePath("/admin/spots");
  revalidatePath("/admin/bookings");
  revalidatePath("/spots");
  return { ok: true };
}
