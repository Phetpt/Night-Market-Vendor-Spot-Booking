import Link from "next/link"

export default function AuthButtons() {
  return(
    <section>
      <div className="flex items-center gap-4">
        <Link href="/login" 
        className="border rounded-xl px-3 py-2 text-ls font-semibold border-slate-300 hover:bg-slate-50 w-24 text-center">
          Log in
        </Link>

        <Link href="/register"
        className="border rounded-xl border-orange-400 px-3 py-2 text-ls font-semibold bg-orange-400 text-white hover:bg-orange-600 w-24 text-center">
          Sign up
        </Link>
      </div>
    </section>
  )
}