import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './slices/cartReducer'
import authReducer from './slices/authReducer'

const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
