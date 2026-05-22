"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2, Eye, EyeOff, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, isAuthenticated } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated()) router.replace("/")
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const ok = await login(username, password)
    if (ok) {
      router.replace("/")
    } else {
      setError("Tên đăng nhập hoặc mật khẩu không đúng")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
            <Building2 className="size-6" />
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">NhàTrọ Pro</p>
            <p className="text-sm text-muted-foreground">Quản lý cho thuê chuyên nghiệp</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl bg-card px-6 py-8 shadow-xs ring-1 ring-foreground/10">
          <h1 className="mb-6 text-base font-semibold">Đăng nhập</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError("") }}
                className={error ? "border-destructive focus-visible:ring-destructive" : ""}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  className={error ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="mt-2 w-full" disabled={loading || !username || !password}>
              {loading && <LoaderCircle className="animate-spin" />}
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
