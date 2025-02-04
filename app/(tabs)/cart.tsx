import {
  FlatList,
  Pressable,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { styles } from '../styles'
import { useMQ, useRS } from 'react-native-full-responsive'
import { RootState } from '../store'
import { useSelector } from 'react-redux'
import ProductFlavours, { TFlavourGroup, TFlavoursResponse } from '@/components/ProductFlavours'
import { useContext, useEffect, useState } from 'react'
import { ErrorContext, ConfirmContext } from '../_layout'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { FONT_SIZES } from '@/components/Constants'

export default function Cart() {
  const [editingItem, setEditingItem] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [itemsWithFlavours, setItemsWithFlavours] = useState<any[]>([])
  const [itemOrderDetails, setItemOrderDetails] = useState<Map<string, string>>(
    new Map(),
  )

  const mq = useMQ()
  const rs = useRS(1)

  const { showErrorModal } = useContext(ErrorContext)
  const { showConfirmModal } = useContext(ConfirmContext)

  const cart = useSelector((state: RootState) => state.cart)

  const router = useRouter()

  useEffect(() => {
    for (const item of cart.items) {
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/menu/flavours/${item.id}`)
        .then(res => (res.status == 200 ? res.json() : res.text()))
        .then((data: string | unknown[]) => {
          if (typeof data === 'string') {
            showErrorModal(data)
          } else {
            setItemsWithFlavours(state => [
              ...state,
              { id: item.id, has: data.length > 0 },
            ])
          }
        })
    }
  }, [cart])

  const hasFlavours = (id: number) => {
    return itemsWithFlavours.find(item => item.id === id)?.has
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setDetails = (id: string, details: any) => {
    setItemOrderDetails(state => {
      const newState = new Map(state)
      newState.set(id, details)
      return newState
    })
  }

  const handleContinue = async () => {
    for (const item of cart.items) {
      if (hasFlavours(item.id)) {
        for (let i = 0; i < item.quantity; i++) {
          const itemKey = `${item.id}_${i}`
          const itemDetails = itemOrderDetails.get(itemKey)
          if (!itemDetails) {
            showErrorModal(
              `Debe seleccionar al menos un gusto para ${item.name}.`
            );
            return;
          }
        }
      }
    }
    for (const item of cart.items) {
      if (hasFlavours(item.id)) {
        for (let i = 0; i < item.quantity; i++) {
          const itemKey = `${item.id}_${i}`
          const itemDetails = itemOrderDetails.get(itemKey)
            const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/menu/flavours/${item.id}`);
            const data = res.status == 200 ? await res.json() : await res.text();
            if (typeof data === 'string') {
            showErrorModal(data);
            } else {
            const atLeastOneFlavour: { [key: string]: number[] } = {};
            const countedGroups = new Map<string, number>();
            data.forEach((flavour: TFlavoursResponse) => {
              if (flavour.quantity == 1) {
              atLeastOneFlavour[flavour.grp_title] = (atLeastOneFlavour[flavour.grp_title] || []).concat(flavour.flv_id);
              }
              if (!countedGroups.has(flavour.grp_title)) {
              countedGroups.set(flavour.grp_title, flavour.quantity);
              } else {
              countedGroups.set(
                flavour.grp_title,
                Math.max(countedGroups.get(flavour.grp_title)!, flavour.quantity)
              );
              }
            });

            for (const [group, flavours] of Object.entries(atLeastOneFlavour)) {
              const itemFlavours = item.flavours?.[i] ?? [];
              if (!flavours.some(flavour => itemFlavours.includes(flavour))) {
              showErrorModal(`Debe seleccionar una opción de ${group} en ${item.name}.`);
              return;
              }
            }

            const totalMaxQuantities = Array.from(countedGroups.values()).reduce(
              (sum, max) => sum + max,
              0
            );

            if (totalMaxQuantities > (itemDetails?.split(',').length ?? 0)) {
              const confirmed = await showConfirmModal(
              `¿Estás seguro de que deseas continuar con ${item.name} sin seleccionar todas las opciones?`
              );
              if (!confirmed) return;
            }
            }
        }
      }
    }
    router.push('/order')
  }

  return (
    <View
      style={{
        display: 'flex',
        backgroundColor: '#181815',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <View style={styles.screenTitle as ViewStyle}>
      </View>
      {cart.items.length === 0 && (
        <Text
          style={{
            color: '#D2C682',
            fontFamily: 'Overlock',
            fontSize: FONT_SIZES.large * rs,
            marginTop: 15,
          }}
        >
          No hay productos en el carrito
        </Text>
      )}
      <FlatList
        style={{ width: '80%', height: '100%' } as ViewStyle}
        data={cart.items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => {
          if (!hasFlavours(item.id)) {
            return (
              <View key={item.id} style={cartStyles.itemContainer}>
                <View style={cartStyles.itemAccordion as ViewStyle}>
                  <Text
                    style={{
                      color: '#D2C682',
                      fontFamily: 'Overlock',
                      fontSize: ['xs', 'sm'].includes(mq) ? 40 * rs : 24 * rs,
                    }}
                  >
                    {`${item.quantity} x `}
                  </Text>
                  <Text
                    style={{
                      color: '#D2C682',
                      fontFamily: 'Overlock',
                      fontSize: ['xs', 'sm'].includes(mq) ? 40 * rs : 24 * rs,
                      flex: 1,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      color: '#D2C682',
                      fontFamily: 'Overlock',
                      fontSize: ['xs', 'sm'].includes(mq) ? 40 * rs : 24 * rs,
                    }}
                  >
                    ${item.price * item.quantity}
                  </Text>
                </View>
              </View>
            )
          }
          return (
            <>
              {Array.from({ length: item.quantity }).map((_, index) => {
                const itemKey = `${item.id}_${index}`
                return (
                  <View key={itemKey} style={cartStyles.itemContainer}>
                    <Pressable
                      style={cartStyles.itemAccordion as ViewStyle}
                      onPress={() =>
                        setEditingItem(editingItem === itemKey ? null : itemKey)
                      }
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: '#D2C682',
                            fontFamily: 'Overlock',
                            fontSize: ['xs', 'sm'].includes(mq)
                              ? 40 * rs
                              : 24 * rs,
                            flex: 1,
                          }}
                        >
                          {editingItem === itemKey ? (
                            <Ionicons
                              size={
                                ['xs', 'sm'].includes(mq) ? 40 * rs : 24 * rs
                              }
                              name="caret-up-outline"
                              style={{ verticalAlign: '-4px' }}
                            />
                          ) : (
                            <Ionicons
                              size={
                                ['xs', 'sm'].includes(mq) ? 40 * rs : 24 * rs
                              }
                              name="caret-down-outline"
                              style={{ verticalAlign: '-4px' }}
                            />
                          )}
                          {` ${item.name}`}
                        </Text>
                        <Text
                          style={{
                            color: '#EED7',
                            fontFamily: 'Overlock',
                            fontSize: ['xs', 'sm'].includes(mq)
                              ? 28 * rs
                              : 14 * rs,
                          }}
                        >
                          {itemOrderDetails.get(itemKey)}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: '#D2C682',
                          fontFamily: 'Overlock',
                          fontSize: ['xs', 'sm'].includes(mq)
                            ? 40 * rs
                            : 24 * rs,
                        }}
                      >
                        ${item.price}
                      </Text>
                    </Pressable>
                    <ProductFlavours
                      prodId={item.id}
                      visible={editingItem === itemKey}
                      setDetails={setDetails}
                      itemKey={itemKey}
                    />
                  </View>
                )
              })}
            </>
          )
        }}
      />
      <Pressable
        style={{ backgroundColor: '#181815' }}
        onPress={handleContinue}
      >
        <View
          style={{
            backgroundColor: '#A11F1F',
            paddingVertical: rs * 15,
            paddingHorizontal: rs * 30,
            margin: rs * 15,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: '#D2C682',
              fontFamily: 'Overlock',
              fontSize: ['xs', 'sm'].includes(mq) ? 45 * rs : 24 * rs,
              textAlign: 'center',
            }}
          >
            Continuar
          </Text>
        </View>
      </Pressable>
    </View>
  )
}

const cartStyles = {
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#EED3',
    padding: 10,
  },
  itemAccordion: {
    flex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  itemText: {
    color: '#D2C682',
    fontFamily: 'Overlock',
    fontSize: 24,
  },
}