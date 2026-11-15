"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveSpot } from "@/lib/admin-spots/actions";
import type { Spot } from "@/types/spot";

type Props = {
  mode: "create" | "edit";
  spot?: Spot;
  takenNumbers: string[]; // spotNumber ที่มีอยู่แล้ว ใช้เช็กซ้ำก่อนส่ง
};

type Key = "spotNumber" | "zone" | "spotSize" | "locationDescription" | "rentalFee";
type Errors = Partial<Record<Key, string>>;

const FIELDS: { key: Key; label: string; placeholder: string }[] = [
  { key: "spotNumber", label: "Spot number", placeholder: "A01" },
  { key: "zone", label: "Zone", placeholder: "Food zone" },
  { key: "spotSize", label: "Size", placeholder: "2 x 2 m" },
  { key: "locationDescription", label: "Location", placeholder: "Near the main entrance" },
  { key: "rentalFee", label: "Rental fee (฿)", placeholder: "300" },
];

function initial(spot?: Spot): Record<Key, string> {
  return {
    spotNumber: spot?.spotNumber ?? "",
    zone: spot?.zone ?? "",
    spotSize: spot?.spotSize ?? "2 x 2 m",
    locationDescription: spot?.locationDescription ?? "",
    rentalFee: spot ? String(spot.rentalFee) : "",
  };
}

export default function SpotFormButton({ mode, spot, takenNumbers }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(initial(spot));
  const [errors, setErrors] = useState<Errors>({});
  const [banner, setBanner] = useState<string | null>(null);

  function openDialog() {
    setValues(initial(spot));
    setErrors({});
    setBanner(null);
    dialogRef.current?.showModal();
  }

  function validate(): Errors {
    const e: Errors = {};
    for (const f of FIELDS) {
      if (!values[f.key].trim()) e[f.key] = "Required";
    }
    const fee = Number(values.rentalFee);
    if (!e.rentalFee && (!Number.isFinite(fee) || fee < 0)) {
      e.rentalFee = "Enter a number (0 or more)";
    }
    const mine = spot?.spotNumber.toLowerCase();
    const num = values.spotNumber.trim().toLowerCase();
    if (
      !e.spotNumber &&
      takenNumbers.some((n) => n.toLowerCase() === num && n.toLowerCase() !== mine)
    ) {
      e.spotNumber = "This spot number already exists";
    }
    return e;
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setBanner(null);
    startTransition(async () => {
      const res = await saveSpot({
        id: spot?._id,
        spotNumber: values.spotNumber,
        zone: values.zone,
        spotSize: values.spotSize,
        locationDescription: values.locationDescription,
        rentalFee: Number(values.rentalFee),
      });
      if (!res.ok) {
        setBanner(res.message);
        return;
      }
      dialogRef.current?.close();
      router.refresh();
    });
  }

  return (
    <>
      {mode === "create" ? (
        <button
          type="button"
          onClick={openDialog}
          className="rounded-xl bg-[#8A3F1D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6F3217]"
        >
          Add spot
        </button>
      ) : (
        <button
          type="button"
          onClick={openDialog}
          className="text-sm font-semibold text-[#8A3F1D] hover:underline"
        >
          Edit
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="m-auto w-[calc(100%-2rem)] max-w-[520px] rounded-2xl border border-[#DDE3F2] p-0 backdrop:bg-black/40"
      >
        <form onSubmit={onSubmit} className="space-y-4 p-6 text-left">
          <h2 className="text-xl font-bold text-[#1B2038]">
            {mode === "create" ? "Add spot" : `Edit spot ${spot?.spotNumber}`}
          </h2>

          {banner && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {banner}
            </div>
          )}

          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-semibold text-[#1F2A44]">
                {f.label}
              </label>
              <input
                value={values[f.key]}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                inputMode={f.key === "rentalFee" ? "numeric" : undefined}
                className="w-full rounded-xl border border-[#DDE3F2] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#8A3F1D] focus:ring-2 focus:ring-[#8A3F1D]/30"
              />
              {errors[f.key] && (
                <p className="mt-1 text-xs text-red-600">{errors[f.key]}</p>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
              className="rounded-xl border border-[#DDE3F2] px-4 py-2 text-sm font-semibold text-[#1F2A44] hover:bg-[#FFF4EC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-[#8A3F1D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6F3217] disabled:opacity-60"
            >
              {pending ? "Saving…" : mode === "create" ? "Add spot" : "Save changes"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}