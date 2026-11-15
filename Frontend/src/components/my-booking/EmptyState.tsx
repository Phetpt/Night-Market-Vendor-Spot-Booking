import Link from "next/link"

type Props = {
  title: string
  description: string
  action?: { href: string; label: string }
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-[#DDE3F2] bg-white p-5">
      <div className="space-y-1">
        <p className="font-bold text-[#1F2A44]">{title}</p>
        <p className="text-sm text-[#4A5470]">{description}</p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-11 items-center rounded-xl bg-[#8A3F1D] px-4 font-bold text-white hover:bg-[#6F3217] focus-visible:ring-2 focus-visible:ring-[#8A3F1D] focus-visible:ring-offset-2"
          >
          {action.label}
        </Link>
      )}
    </div>
  )
}