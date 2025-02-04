export interface User {
  google_id: string
  id: number
  name: string
  email: string
  phone: string
  is_guest: boolean
  is_admin: boolean
  created_at: string
}

export interface AuthState {
  user: Partial<User> | null
  isGuest: boolean
  isAdmin: boolean
  isAuthenticated: boolean
}
