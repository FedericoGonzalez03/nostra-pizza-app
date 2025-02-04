import React, { useEffect, useState, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { CartItem } from '../types/cartTypes'
import { addItem, removeItem, setItemQuantity } from '../slices/cartReducer'
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { styles } from '../styles'
import { useMQ, useRH, useRS, useRW } from 'react-native-full-responsive'
import HorizontalItem from '@/components/HorizontalItem'
import VerticalItem from '@/components/VerticalItem'
import { ErrorContext } from '../_layout'
import { useRouter } from 'expo-router'
import adminStyles from '@/components/admin/adminStyles'

export default function MenuPage() {
  const items: CartItem[] = useSelector((state: RootState) => state.cart.items)
  const total: number = useSelector(
    (state: RootState) => state.cart.totalAmmount,
  )
  const dispatch = useDispatch<AppDispatch>()
  const [listItems, setListItems] = useState<CartItem[]>([])
  const [loadingItems, setLoadingItems] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const { showErrorModal } = useContext(ErrorContext)

  const router = useRouter()

  const removeItemFromCart = (id: number) => {
    setListItems(
      listItems.map(item => (item.id === id ? { ...item, quantity: 1 } : item)),
    )
    dispatch(removeItem(id))
  }

  const addItemToCart = (item: CartItem) => {
    dispatch(addItem(item))
  }

  const setItemQty = (id: number, qty: number, forDispatch: boolean) => {
    if (id) {
      setListItems(
        listItems.map(item =>
          item.id === id ? { ...item, quantity: qty } : item,
        ),
      )
      if (forDispatch) {
        if (qty > 0) dispatch(setItemQuantity({ id, qty }))
        if (qty == 0) removeItemFromCart(id)
      }
    }
  }

  const handleQuantityChange = (
    id: number,
    text: string,
    dispatch: boolean,
  ) => {
    if (text === undefined) return
    const quantity = text === '' ? 0 : parseInt(text, 10)
    setItemQty(id, quantity, dispatch)
  }

  const isInCart = (item: CartItem) => {
    return items.some(i => i.id === item.id)
  }

  const getQuantityFromCart = (item: Partial<CartItem>) => {
    const cartItem = items.filter(i => i.id === item.id)[0]
    if (cartItem) return cartItem.quantity
    return 1
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      buscarProductos(search)
    }, 500)
    return () => clearTimeout(delayedSearch)
  }, [search])

  const buscarProductos = (text?: string) => {
    setLoadingItems(true)
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/menu?search=${text ?? ''}`)
      .then(res => (res.status == 200 ? res.json() : res.text()))
      .then((data: string | CartItem[]) => {
        if (typeof data === 'string') {
          setLoadingItems(false)
          showErrorModal(data)
        } else {
          setLoadingItems(false)
          setListItems(
            data
              .filter((item: CartItem) => item.available)
              .map((item: CartItem) => ({
                ...item,
                price: Number.parseFloat(String(item.price)),
                quantity: getQuantityFromCart(item),
              })),
          )
        }
      })
  }

  const rs = useRS(1)
  const mq = useMQ()

  return (
    <>
      <View
        style={{
          display: 'flex',
          backgroundColor: '#181815',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Text
          style={[
            styles.screenTitle as TextStyle,
            { fontSize: ['xs', 'sm'].includes(mq) ? 50 * rs : 30 * rs },
          ]}
        >
          Menú
        </Text>
        <TextInput
          value={search}
          style={
            [
              adminStyles.input as TextStyle,
              {
                marginVertical: rs * 15,
                width: '80%',
                height: ['xs', 'sm'].includes(mq) ? rs * 80 : rs * 50,
              },
            ] as unknown as TextStyle
          }
          onChangeText={text => setSearch(text)}
          placeholder="Buscar por nombre o descripción"
          placeholderTextColor={'#F5F5DC'}
        />
        {loadingItems ? (
          <View
            style={{
              display: 'flex',
              height: 200,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator color={'#D2C682'} />
          </View>
        ) : (
          <FlatList
            style={{ width: '80%', height: '100%' } as ViewStyle}
            contentContainerStyle={
              ['xs', 'sm'].includes(mq)
                ? (styles.oneColitemsList as ViewStyle)
                : (styles.twoColitemsList as ViewStyle)
            }
            data={[listItems].flat()}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) =>
              ['xs', 'sm'].includes(mq) ? (
                <VerticalItem
                  item={item}
                  isInCart={isInCart}
                  addItemToCart={addItemToCart}
                  setItemQty={setItemQty}
                  handleQuantityChange={handleQuantityChange}
                  removeItemFromCart={removeItemFromCart}
                />
              ) : (
                <HorizontalItem
                  item={item}
                  isInCart={isInCart}
                  addItemToCart={addItemToCart}
                  setItemQty={setItemQty}
                  handleQuantityChange={handleQuantityChange}
                  removeItemFromCart={removeItemFromCart}
                />
              )
            }
          ></FlatList>
        )}
          <Pressable
            style={
              ['xs', 'sm'].includes(mq)
                ? { backgroundColor: '#181815' }
                : {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }
            }
            disabled={total === 0}
            onPress={() => router.push('/cart')}
          >
          <View
            style={[{
                backgroundColor: total === 0 ? '#D94343':'#A11F1F',
                paddingVertical: rs * 15,
                paddingHorizontal: rs * 30,
                margin: rs * 15,
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'row',
                flexShrink: 1,
                justifyContent: ['xs', 'sm'].includes(mq)
                  ? 'space-between'
                  : 'flex-end',
                gap: ['xs', 'sm'].includes(mq) ? 25 * rs : 15 * rs,
              },
              Platform.OS == 'web' && total == 0 && { cursor: 'not-allowed' } as unknown as ViewStyle
            ]}
          >
            <Text
              style={{
                color: total === 0 ? '#F2D6A2' : '#D2C682',
                fontFamily: 'Overlock',
                fontSize: ['xs', 'sm'].includes(mq) ? 45 * rs : 24 * rs,
                textAlign: 'center',
              }}
            >
              Total: ${total}
            </Text>
            {total != 0 && 
              <Text
                style={{
                  color: total === 0 ? '#F2D6A2' : '#D2C682',
                  fontFamily: 'Overlock',
                  fontSize: ['xs', 'sm'].includes(mq) ? 45 * rs : 24 * rs,
                  textAlign: 'center',
                }}
              >
                Continuar
              </Text>
            }
          </View>
        </Pressable>
      </View>
    </>
  )
}
