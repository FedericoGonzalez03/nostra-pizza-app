import { styles } from '@/app/styles'
import { CartItem } from '@/app/types/cartTypes'
import { Ionicons } from '@expo/vector-icons'
import {
  Image,
  ImageStyle,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { useRS } from 'react-native-full-responsive'
import { FONT_SIZES } from './Constants'

export default function VerticalItem({
  item,
  isInCart,
  setItemQty,
  handleQuantityChange,
  removeItemFromCart,
  addItemToCart,
}: {
  item: CartItem
  isInCart: (item: CartItem) => boolean
  setItemQty: (id: number, qty: number, forDispatch: boolean) => void
  handleQuantityChange: (id: number, text: string, dispatch: boolean) => void
  removeItemFromCart: (id: number) => void
  addItemToCart: (item: CartItem) => void
}) {
  const rs = useRS(1)

  return (
    <View
      style={[
        styles.itemContainer as ViewStyle,
        { flexDirection: 'column', justifyContent: 'space-evenly', gap: 0 },
      ]}
      key={item.id}
    >
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          width: '100%',
          gap: 15 * rs,
        }}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage as ImageStyle}
        ></Image>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5 * rs,
            flexShrink: 1,
          }}
        >
          <Text style={[styles.itemName as TextStyle, { fontSize: FONT_SIZES.large * rs }]}>
            {item.name}
          </Text>
          <Text
            style={[styles.itemDescription as TextStyle, { fontSize: FONT_SIZES.medium * rs }]}
          >
            {item.description}
          </Text>
        </View>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={[
            styles.itemPrice as TextStyle,
            { marginLeft: 11, fontSize: FONT_SIZES.large * rs, fontWeight: 400 },
          ]}
        >
          ${item.price}
        </Text>
        {isInCart(item) ? (
          <View style={styles.itemController as ViewStyle}>
            <View style={styles.itemQuantityControllerContainer as ViewStyle}>
              <View
                style={[
                  styles.itemQuantityController as ViewStyle,
                  { width: 36, height: 36 },
                ]}
              >
                <Ionicons
                  color={'#F5F5DC'}
                  size={36}
                  name="remove-circle-outline"
                  onPress={() => setItemQty(item.id, item.quantity - 1, true)}
                />
              </View>
              <TextInput
                style={[
                  styles.itemQuantityInput as TextStyle,
                  { width: 26, height: 30, fontSize: 14 },
                ]}
                keyboardType="numeric"
                value={String(item.quantity)}
                onBlur={e =>
                  handleQuantityChange(item.id, e.nativeEvent.text, true)
                }
                onChangeText={text =>
                  handleQuantityChange(item.id, text, false)
                }
              />
              <View
                style={[
                  styles.itemQuantityController as ViewStyle,
                  { width: 36, height: 36 },
                ]}
              >
                <Ionicons
                  color={'#F5F5DC'}
                  size={36}
                  name="add-circle-outline"
                  onPress={() => setItemQty(item.id, item.quantity + 1, true)}
                />
              </View>
            </View>
            <View>
              <Ionicons
                color={'#F5F5DC'}
                size={36}
                title="Eliminar"
                name="close-outline"
                onPress={() => removeItemFromCart(item.id)}
              />
            </View>
          </View>
        ) : (
          <View>
            <Ionicons
              color={'#F5F5DC'}
              size={36}
              title="Agregar"
              name="add-outline"
              onPress={() => addItemToCart(item)}
            />
          </View>
        )}
      </View>
    </View>
  )
}
