"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeSpot } from "@/lib/admin-spots/actions";
import { DAILY_LIMIT } from "@/lib/my-booking/summary";

type Props = {
  spotId: string;
  spotNumber: string;
  zone: string;
};

export default function DeleteSpotButton({ spotId, spotNumber, zone }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function confirmDelete() {
    setError(null);
    startTransition(async () => {
      const res = await removeSpot(spotId);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      dialogRef.current?.close();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="text-sm font-semibold text-red-600 hover:underline"
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-[440px] rounded-2xl border border-[#DDE3F2] p-0 backdrop:bg-black/40"
      >
        <div className="space-y-4 p-6 text-left">
          <h2 className="text-xl font-bold text-[#1B2038]">
            Delete spot {spotNumber}?
          </h2>
          <p className="text-sm text-[#4A5470]">
            {zone} · {spotNumber}
          </p>

          <ul className="list-disc space-y-1 pl-5 text-sm text-[#1F2A44]">
            <li>The spot disappears from the Spot page and can no longer be booked.</li>
            <li>
              Existing bookings for this spot are <b>not</b> removed. They still
              count toward each member&apos;s {DAILY_LIMIT}-spot limit per night.
            </li>
            <li>This can&apos;t be undone from this app.</li>
          </ul>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Couldn&apos;t delete. {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
              className="rounded-xl border border-[#DDE3F2] px-4 py-2 text-sm font-semibold text-[#1F2A44] hover:bg-[#FFF4EC]"
            >
              No, keep it
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={pending}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {pending ? "Deleting…" : error ? "Try again" : "Yes, delete spot"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}