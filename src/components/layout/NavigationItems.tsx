import Link from "next/link";


export default function NavigationItems({title, pageRef, isActive = false}: {title: string, pageRef: string, isActive?: boolean}) {
  return(
    <Link href={pageRef} aria-current={isActive ? "page" : undefined} 
    className={`text-base transition-colors ${isActive ? "font-medium text-zinc-950" : "text-zinc-500 hover:text-zinc-950"}`}>
      {title}
    </Link>
  )
}