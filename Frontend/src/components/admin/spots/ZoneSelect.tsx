"use client";

import { useId } from "react";
import type { ZoneInfo } from "@/lib/spots/zones";


export const NEW_ZONE = "__new__";

type Props = {
  zones: ZoneInfo[];
  freeCodes: string[];
  value: string;
  onChange: (value: string) => void;
  newCode: string;
  onNewCodeChange: (value: string) => void;
  newName: string;
  onNewNameChange: (value: string) => void;
  inputClass: string;
  labelClass: string;
  disabled?: boolean;
  zoneError?: string;
  codeError?: string;
  nameError?: string;
};

export default function ZoneSelect({
  zones,
  freeCodes,
  value,
  onChange,
  newCode,
  onNewCodeChange,
  newName,
  onNewNameChange,
  inputClass,
  labelClass,
  disabled,
  zoneError,
  codeError,
  nameError,
}: Props) {
  const zoneId = useId();
  const codeId = useId();
  const nameId = useId();

  return (
    <div>
      <label htmlFor={zoneId} className={labelClass}>
        Zone
      </label>
      <select
        id={zoneId}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      >
        <option value="" disabled>
          Select a zone…
        </option>
        {zones.map((z) => (
          <option key={z.code} value={z.code}>
            {z.code} — {z.name}
          </option>
        ))}
        <option value={NEW_ZONE} disabled={freeCodes.length === 0}>
          + Create new zone…
        </option>
      </select>
      {zoneError && <p className="mt-1 text-xs text-red-600">{zoneError}</p>}

      {value === NEW_ZONE && (
        <div className="mt-3 grid grid-cols-[96px_1fr] gap-3 rounded-xl border border-[#DDE3F2] bg-[#F7F8FC] p-3">
          <div>
            <label htmlFor={codeId} className={labelClass}>
              Letter
            </label>
            <select
              id={codeId}
              value={newCode}
              disabled={disabled}
              onChange={(e) => onNewCodeChange(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                —
              </option>
              {freeCodes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {codeError && <p className="mt-1 text-xs text-red-600">{codeError}</p>}
          </div>
          <div>
            <label htmlFor={nameId} className={labelClass}>
              Zone name
            </label>
            <input
              id={nameId}
              value={newName}
              disabled={disabled}
              maxLength={30}
              placeholder="Dessert zone"
              onChange={(e) => onNewNameChange(e.target.value)}
              className={inputClass}
            />
            {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
