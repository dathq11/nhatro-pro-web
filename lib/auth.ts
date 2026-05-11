const AUTH_KEY = "nha-tro-auth"

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(AUTH_KEY) === "1"
}

export function login(username: string, password: string): boolean {
  if (username === "***" && password === "***") {
    localStorage.setItem(AUTH_KEY, "1")
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}
