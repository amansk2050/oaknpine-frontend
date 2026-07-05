import { LoginForm } from "@/components/login-form"
import { Suspense } from "react"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[300px]">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500">Loading form...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
