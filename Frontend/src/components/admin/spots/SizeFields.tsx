"use client";

import { sanitizeDecimal } from "@/lib/spots/validation";

type Size = { width: string; depth: string };

type Props = {
  width: string;
  depth: string;
  onChange: (next: Size) => void;
  inputClass: string;
  disabled?: boolean;
  error?: string | null;
};

const PRESETS: Size[] = [
  { width: "2", depth: "2" },
  { width: "3", depth: "3" },
  { width: "2", depth: "3" },
];

export default function SizeFields({
  width,
  depth,
  onChange,
  inputClass,
  disabled,
  error,
}: Props) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          aria-label="Width in metres"
          aria-invalid={Boolean(error)}
          maxLength={5}
          placeholder="2"
          value={width}
          disabled={disabled}
          onChange={(e) => onChange({ width: sanitizeDecimal(e.target.value, 1), depth })}
          className={`${inputClass} min-w-0 flex-1`}
        />
        <span aria-hidden="true" className="text-[#4A5470]">
          x
        </span>
        <input
          type="text"
          inputMode="decimal"
          aria-label="Depth in metres"
          aria-invalid={Boolean(error)}
          maxLength={5}
          placeholder="2"
          value={depth}
          disabled={disabled}
          onChange={(e) => onChange({ width, depth: sanitizeDecimal(e.target.value, 1) })}
          className={`${inputClass} min-w-0 flex-1`}
        />
        <span className="text-sm font-semibold text-[#4A5470]">m</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const active = width === p.width && depth === p.depth;
          return (
            <button
              key={`${p.width}x${p.depth}`}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onChange(p)}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#8A3F1D] disabled:opacity-60 ${
                active
                  ? "border-[#8A3F1D] bg-[#FFF4EC] text-[#8A3F1D]"
                  : "border-[#DDE3F2] bg-white text-[#4A5470] hover:bg-[#FFF4EC]"
              }`}
            >
              {p.width} × {p.depth} m
            </button>
          );
        })}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
