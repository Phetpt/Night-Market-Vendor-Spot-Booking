import { Pencil } from "lucide-react"

type Props = {
  editing: boolean
  message: string
  isError: boolean
  pending: boolean
  onDiscard: () => void
  onSave: () => void
  onClose: () => void
  onEdit: () => void
}

export default function EditBookingFooter({
  editing,
  message,
  isError,
  pending,
  onDiscard,
  onSave,
  onClose,
  onEdit,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EFF4FF] px-6 py-4">
      <p className={`text-sm ${isError ? "font-semibold text-red-700" : "text-[#4A5470]"}`}>
        {message}
      </p>

      <div className="flex flex-wrap gap-2">
        {editing ? (
          <>
            <button
              type="button"
              onClick={onDiscard}
              disabled={pending}
              className="rounded-xl border border-[#DDE3F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#1B2038] hover:bg-[#FFF4EC] disabled:opacity-50"
            >
              Discard changes
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={pending}
              className="rounded-xl bg-[#8A3F1D] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6F3217] disabled:bg-[#C49A86]"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#DDE3F2] bg-white px-4 py-2.5 text-sm font-semibold text-[#1B2038] hover:bg-[#FFF4EC]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-xl bg-[#8A3F1D] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#6F3217]"
            >
              <Pencil className="size-4" />
              Edit Booking
            </button>
          </>
        )}
      </div>
    </div>
  )
}
