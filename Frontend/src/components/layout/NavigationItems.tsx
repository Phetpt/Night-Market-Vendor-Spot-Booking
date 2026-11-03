import Link from "next/link";

type NavigationItemProps = {
  title: string,
  pageRef: string,
  isActive?: boolean,
  onClick?: ()=>void;
}

export default function NavigationItem({title, pageRef, isActive = false, onClick}: NavigationItemProps) {
  return(
    <Link 
    href={pageRef} 
    onClick={onClick}
    aria-current={isActive ? "page" : undefined} 
    className={`text-base transition-colors ${isActive ? "font-medium text-zinc-950" : "text-zinc-500 hover:text-zinc-950"}`}>
      {title}
    </Link>
  )
}