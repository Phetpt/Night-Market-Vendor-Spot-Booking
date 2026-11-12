import { LoginForm } from "@/components/auth/LoginForm"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { registered } = await searchParams

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10 md:h-[calc(100svh-4rem)] md:min-h-0 md:overflow-hidden">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm registered={registered === "1"} />
      </div>
    </div>
  )
}
