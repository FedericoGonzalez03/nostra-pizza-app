import { styles } from "@/app/styles";
import { CartItem } from "@/app/types/cartTypes";
import { Ionicons } from "@expo/vector-icons";
import { Image, ImageStyle, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { useRS } from "react-native-full-responsive";

export default function HorizontalItem(
	{ item, isInCart, setItemQty, handleQuantityChange, removeItemFromCart, addItemToCart }
		:
		{ item: CartItem, isInCart: (item: CartItem) => boolean, setItemQty: (id: number, qty: number, forDispatch: boolean) => void, handleQuantityChange: (id: number, text: string, dispatch: boolean) => void, removeItemFromCart: (id: number) => void, addItemToCart: (item: CartItem) => void }
) {

	const rs = useRS(0.7);

	return <View style={styles.itemContainer as ViewStyle} key={item.id}>
		<Image source={{ uri: `data:image/jpeg;base64,${item.image}` }} style={styles.itemImage as ImageStyle}></Image>
		<View style={styles.itemInfo as ViewStyle}>
			<Text style={[styles.itemName as TextStyle, { fontSize: 36 * rs }]}>{item.name}</Text>
			<Text style={[styles.itemDescription as TextStyle, { fontSize: 24 * rs, }]}>{item.description}</Text>
		</View>
		<View style={styles.itemPriceAndController as ViewStyle}>
			<Text style={[styles.itemPrice as TextStyle, { fontSize: 26 * rs, fontWeight: 400 }]}>${item.price}</Text>
			{isInCart(item) ?
				<View style={[styles.itemController as ViewStyle, { height: 80 * rs, flexDirection: 'column-reverse', gap: 0, alignItems: "flex-end" }]}>
					<View style={styles.itemQuantityControllerContainer as ViewStyle}>
						<View style={[styles.itemQuantityController as ViewStyle, { width: 42 * rs, height: 42 * rs }]}>
							<Ionicons
								color={'#F5F5DC'}
								size={42 * rs}
								name='remove-circle-outline'
								onPress={() => setItemQty(item.id, item.quantity - 1, true)} />
						</View>
						<TextInput
							style={[styles.itemQuantityInput as TextStyle, { width: 42 * rs, height: 42 * rs, fontSize: 16 * rs }]}
							keyboardType="numeric"
							value={String(item.quantity)}
							onBlur={(e) => handleQuantityChange(item.id, e.nativeEvent.text, true)}
							onChangeText={(text) => handleQuantityChange(item.id, text, false)} />
						<View style={[styles.itemQuantityController as ViewStyle, { width: 42 * rs, height: 42 * rs }]}>
							<Ionicons
								color={'#F5F5DC'}
								size={42 * rs}
								name='add-circle-outline'
								onPress={() => setItemQty(item.id, item.quantity + 1, true)} />
						</View>
					</View>
					<View>
						<Ionicons
							color={'#F5F5DC'}
							size={42 * rs}
							title="Eliminar"
							name='close-outline'
							onPress={() => removeItemFromCart(item.id)} />
					</View>
				</View>
				:
				<View style={{ height: 80 * rs }}>
					<Ionicons
						color={'#F5F5DC'}
						size={42 * rs}
						title="Agregar"
						name='add-outline'
						onPress={() => addItemToCart(item)} />
				</View>
			}
		</View>
	</View>;
}
