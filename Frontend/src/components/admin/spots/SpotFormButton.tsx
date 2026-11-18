"use client";

import { useId, useMemo, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveSpot } from "@/lib/admin-spots/actions";
import { sizeToFields } from "@/lib/spots/format";
import {
  LOCATION_MAX,
  cleanText,
  sanitizeDecimal,
  validateDimension,
  validateFee,
  validateLocation,
  validateZoneName,
} from "@/lib/spots/validation";
import { deriveZones, getNextSpotNumber, unusedZoneCodes } from "@/lib/spots/zones";
import type { Spot } from "@/types/spot";
import SizeFields from "./SizeFields";
import ZoneSelect, { NEW_ZONE } from "./ZoneSelect";

type Props = {
  mode: "create" | "edit";
  spot?: Spot;
  spots: Spot[]; // spot ทั้งหมด ใช้สร้างรายการโซนและเลขถัดไป
  label?: string;
  variant?: "primary" | "link";
};

type Errors = {
  zone?: string;
  newCode?: string;
  newName?: string;
  size?: string;
  location?: string;
  fee?: string;
};

const inputClass =
  "w-full rounded-xl border border-[#DDE3F2] px-3 py-2 text-sm text-[#1F2A44] outline-none focus:border-[#8A3F1D] focus:ring-2 focus:ring-[#8A3F1D]/30";
const labelClass = "mb-1 block text-sm font-semibold text-[#1F2A44]";
const readOnlyClass =
  "rounded-xl border border-[#DDE3F2] bg-[#F7F8FC] px-3 py-2 text-sm font-semibold text-[#1F2A44]";

function initialValues(spot?: Spot) {
  const size = spot ? sizeToFields(spot.spotSize) : { width: "2", depth: "2" };
  return {
    width: size.width,
    depth: size.depth,
    location: spot?.locationDescription ?? "",
    fee: spot ? String(spot.rentalFee) : "",
  };
}

export default function SpotFormButton({
  mode,
  spot,
  spots,
  label = "Add spot",
  variant = "primary",
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const locationId = useId();
  const feeId = useId();
  const [pending, startTransition] = useTransition();

  const [values, setValues] = useState(initialValues(spot));
  const [zoneChoice, setZoneChoice] = useState(""); // รหัสโซน หรือ NEW_ZONE
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [addAnother, setAddAnother] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const zones = useMemo(() => deriveZones(spots), [spots]);
  const freeCodes = useMemo(() => unusedZoneCodes(spots), [spots]);

  const activeCode = zoneChoice === NEW_ZONE ? newCode : zoneChoice;
  const nextNumber = useMemo(
    () => (mode === "create" && activeCode ? getNextSpotNumber(spots, activeCode) : null),
    [mode, spots, activeCode],
  );

  function computeErrors(): Errors {
    const e: Errors = {};

    if (mode === "create") {
      if (!zoneChoice) {
        e.zone = "Select a zone";
      } else if (zoneChoice === NEW_ZONE) {
        if (!newCode) e.newCode = "Pick a letter";
        const name = cleanText(newName);
        const nameError = validateZoneName(name);
        if (nameError) {
          e.newName = nameError;
        } else if (zones.some((z) => z.name.toLowerCase() === name.toLowerCase())) {
          e.newName = "A zone with this name already exists";
        }
      } else if (nextNumber && !nextNumber.ok) {
        e.zone = `Zone ${zoneChoice} is full (99 spots)`;
      }
    }

    const sizeError =
      validateDimension(values.width, "Width") ?? validateDimension(values.depth, "Depth");
    if (sizeError) e.size = sizeError;

    const locationError = validateLocation(values.location);
    if (locationError) e.location = locationError;

    const feeError = validateFee(values.fee);
    if (feeError) e.fee = feeError;

    return e;
  }

  const errors = computeErrors();
  const shown: Errors = showErrors ? errors : {};

  function openDialog() {
    setValues(initialValues(spot));
    setZoneChoice("");
    setNewCode("");
    setNewName("");
    setAddAnother(false);
    setShowErrors(false);
    setBanner(null);
    setNotice(null);
    dialogRef.current?.showModal();
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setBanner(null);
    setNotice(null);
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      return;
    }

    startTransition(async () => {
      const res = await saveSpot({
        id: spot?._id,
        zoneCode: activeCode,
        newZoneName: zoneChoice === NEW_ZONE ? newName : undefined,
        width: values.width,
        depth: values.depth,
        locationDescription: values.location,
        rentalFee: values.fee,
      });

      router.refresh();

      if (!res.ok) {
        setBanner(res.message);
        return;
      }

      if (mode === "create" && addAnother && res.spotNumber) {
        // คงโซนที่เพิ่งใช้ไว้ 
        setZoneChoice(res.spotNumber.charAt(0));
        setNewCode("");
        setNewName("");
        setShowErrors(false);
        setNotice(`Added ${res.spotNumber}.`);
        return;
      }

      dialogRef.current?.close();
    });
  }

  return (
    <>
      {mode === "create" ? (
        <button
          type="button"
          onClick={openDialog}
          className={
            variant === "link"
              ? "text-sm font-semibold text-[#8A3F1D] hover:underline focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
              : "min-h-11 rounded-xl bg-[#8A3F1D] px-4 text-sm font-semibold text-white hover:bg-[#6F3217] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
          }
        >
          {label}
        </button>
      ) : (
        <button
          type="button"
          onClick={openDialog}
          aria-label={`Edit spot ${spot?.spotNumber}`}
          className="rounded-xl border border-[#8A3F1D] px-3 py-1.5 text-sm font-semibold text-[#8A3F1D] hover:bg-[#8A3F1D] hover:text-white focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
        >
          Edit
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="m-auto max-h-[92vh] w-[calc(100%-2rem)] max-w-[520px] overflow-y-auto rounded-2xl border border-[#DDE3F2] p-0 backdrop:bg-black/40"
      >
        <form onSubmit={onSubmit} noValidate className="space-y-4 p-6 text-left">
          <h2 className="text-xl font-bold text-[#1B2038]">
            {mode === "create" ? "Add spot" : `Edit spot ${spot?.spotNumber}`}
          </h2>

          {banner && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {banner}
            </div>
          )}
          {notice && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {notice}
            </div>
          )}

          {mode === "create" ? (
            <>
              <ZoneSelect
                zones={zones}
                freeCodes={freeCodes}
                value={zoneChoice}
                onChange={setZoneChoice}
                newCode={newCode}
                onNewCodeChange={setNewCode}
                newName={newName}
                onNewNameChange={setNewName}
                inputClass={inputClass}
                labelClass={labelClass}
                disabled={pending}
                zoneError={shown.zone}
                codeError={shown.newCode}
                nameError={shown.newName}
              />

              <div>
                <p className={labelClass}>Spot number</p>
                <div className={readOnlyClass} aria-live="polite">
                  {nextNumber?.ok ? nextNumber.spotNumber : "—"}
                </div>
                <p className="mt-1 text-xs text-[#4A5470]">
                  Assigned automatically using the lowest free number in the zone. The final number
                  is confirmed when you save. Numbers from deleted spots are reused, so avoid
                  deleting spots that have bookings.
                </p>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className={labelClass}>Spot number</p>
                <div className={readOnlyClass}>{spot?.spotNumber}</div>
              </div>
              <div>
                <p className={labelClass}>Zone</p>
                <div className={readOnlyClass}>{spot?.zone}</div>
              </div>
              <p className="col-span-2 -mt-1 text-xs text-[#4A5470]">
                Spot number and zone can&apos;t be changed after the spot is created.
              </p>
            </div>
          )}

          <div>
            <p className={labelClass}>Size</p>
            <SizeFields
              width={values.width}
              depth={values.depth}
              onChange={(next) => setValues({ ...values, ...next })}
              inputClass={inputClass}
              disabled={pending}
              error={shown.size}
            />
          </div>

          <div>
            <label htmlFor={locationId} className={labelClass}>
              Location
            </label>
            <input
              id={locationId}
              value={values.location}
              maxLength={LOCATION_MAX}
              disabled={pending}
              placeholder="Near the main entrance"
              onChange={(e) => setValues({ ...values, location: e.target.value })}
              className={inputClass}
            />
            {shown.location && <p className="mt-1 text-xs text-red-600">{shown.location}</p>}
          </div>

          <div>
            <label htmlFor={feeId} className={labelClass}>
              Rental fee (฿)
            </label>
            <input
              id={feeId}
              type="text"
              inputMode="decimal"
              value={values.fee}
              maxLength={9}
              disabled={pending}
              placeholder="300"
              onChange={(e) => setValues({ ...values, fee: sanitizeDecimal(e.target.value, 2) })}
              className={inputClass}
            />
            {shown.fee && <p className="mt-1 text-xs text-red-600">{shown.fee}</p>}
          </div>

          {mode === "create" && (
            <label className="flex items-center gap-2 text-sm text-[#4A5470]">
              <input
                type="checkbox"
                checked={addAnother}
                disabled={pending}
                onChange={(e) => setAddAnother(e.target.checked)}
                className="size-4 accent-[#8A3F1D]"
              />
              Keep this form open to add another spot
            </label>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={pending}
              className="rounded-xl border border-[#DDE3F2] px-4 py-2 text-sm font-semibold text-[#1F2A44] hover:bg-[#FFF4EC]"
            >
              {notice ? "Done" : "Cancel"}
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
