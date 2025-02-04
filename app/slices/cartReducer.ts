import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CartItem, CartState } from '../types/cartTypes'

const initialState: CartState = {
  items: [],
  totalAmmount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload
      const existingItem = state.items.find(item => item.id == newItem.id)
      if (existingItem) {
        existingItem.quantity += newItem.quantity
        state.totalAmmount += newItem.price * newItem.quantity
      } else {
        state.items.push(newItem)
        state.totalAmmount += newItem.price * newItem.quantity
      }
    },
    setItemQuantity: (
      state,
      action: PayloadAction<{ id: number; qty: number }>,
    ) => {
      const id = action.payload.id
      const qty = action.payload.qty
      const existingItem = state.items.find(item => item.id == id)
      if (existingItem) {
        state.totalAmmount -= existingItem.price * existingItem.quantity
        state.totalAmmount += existingItem.price * qty
        existingItem.quantity = qty
      } else {
        throw new Error('Item not found in cart at setItemQuantity')
      }
    },
    updateItemFlavours: (
      state,
      action: PayloadAction<{ id: number; index: number; flavours: number[] }>,
    ) => {
      const { id, index, flavours } = action.payload
      const existingItem = state.items.find(item => item.id == id)
      if (existingItem) {
        if (!existingItem.flavours) existingItem.flavours = []
        existingItem.flavours[index] = flavours
      } else {
        throw new Error('Item not found in cart at updateItemFlavours')
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      const id = action.payload
      const existingItem = state.items.find(item => item.id == id)
      if (existingItem) {
        state.totalAmmount -= existingItem.price * existingItem.quantity
        state.items = state.items.filter(item => item.id !== id)
      }
    },
    clearCart: state => {
      state.items = []
      state.totalAmmount = 0
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
      state.totalAmmount = action.payload.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      )
    },
  },
})

export const {
  addItem,
  removeItem,
  setItemQuantity,
  clearCart,
  updateItemFlavours,
} = cartSlice.actions

export default cartSlice.reducer
