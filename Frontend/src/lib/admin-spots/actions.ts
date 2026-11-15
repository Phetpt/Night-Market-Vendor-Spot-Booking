"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { createSpot, updateSpot, deleteSpot } from "@/lib/api/spots";
import type { ActionResult } from "@/lib/my-booking/messages";
import { spotMessage } from "./messages";

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;

type SaveSpotInput = {
  id?: string; // มี id = แก้ไข, ไม่มี = สร้างใหม่
  spotNumber: string;
  zone: string;
  spotSize: string;
  locationDescription: string;
  rentalFee: number;
};

function statusOf(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null && "status" in err) {
    const s = (err as { status: unknown }).status;
    return typeof s === "number" ? s : undefined;
  }
  return undefined;
}

export async function saveSpot(input: SaveSpotInput): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, message: spotMessage(401) };
  if (session.user.role !== "admin") return { ok: false, message: spotMessage(403) };

  const body = {
    spotNumber: input.spotNumber.trim(),
    zone: input.zone.trim(),
    spotSize: input.spotSize.trim(),
    locationDescription: input.locationDescription.trim(),
    rentalFee: input.rentalFee,
  };

  if (
    !body.spotNumber ||
    !body.zone ||
    !body.spotSize ||
    !body.locationDescription ||
    !Number.isFinite(body.rentalFee) ||
    body.rentalFee < 0
  ) {
    return { ok: false, message: spotMessage(400) };
  }
  if (input.id && !OBJECT_ID.test(input.id)) {
    return { ok: false, message: spotMessage(404) };
  }

  try {
    if (input.id) {
      await updateSpot(input.id, body, session.accessToken);
    } else {
      await createSpot(body, session.accessToken);
    }
  } catch (err) {
    return { ok: false, message: spotMessage(statusOf(err)) };
  }

  revalidatePath("/admin/spots");
  revalidatePath("/spots");
  return { ok: true };
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