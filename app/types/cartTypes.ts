export interface CartItem {
  id: number
  name: string
  description: string
  price: number
  available?: boolean
  quantity: number
  image?: string
  flavours?: number[][]
}

export interface CartState {
  items: CartItem[]
  totalAmmount: number
}
