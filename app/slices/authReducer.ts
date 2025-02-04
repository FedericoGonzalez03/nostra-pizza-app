import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, User } from '../types/authTypes'

const initialState: AuthState = {
  isAuthenticated: false,
  isGuest: false,
  isAdmin: false,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Partial<User>>) => {
      state.isAuthenticated = true
      state.user = action.payload
      state.isGuest = action.payload.is_guest ?? false
      state.isAdmin = action.payload.is_admin ?? false
    },
    logout: state => {
      state.isAuthenticated = false
      state.user = null
      state.isGuest = false
      state.isAdmin = false
    },
  },
})

export const { login, logout } = authSlice.actions

export default authSlice.reducer
