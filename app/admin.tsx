import React, { useEffect, useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { CartItem } from './types/cartTypes';
import { addItem, removeItem, setItemQuantity } from './slices/cartReducer';
import { FlatList, Image, ImageStyle, Platform, ScrollView, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { styles } from './styles';
import { useMQ, useRH, useRS, useRW } from 'react-native-full-responsive';
import { useRouter } from 'expo-router';
import { DataTable } from 'react-native-paper';
// import { createClient } from '@supabase/supabase-js';
// import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import ProductsAdministration from '@/components/ProductsAdministration';
import { ErrorContext } from './_layout';

export default function AdminPage() {

	const [active, setActive] = useState<string>('productos');
	const [products, setProducts] = useState<CartItem[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

	const rs = useRS(1);
	const rh = useRH(1);
	const rw = useRW(1);
	const mq = useMQ();

	const router = useRouter();

	const { showErrorModal } = useContext(ErrorContext);

	useEffect(() => {
		if (active == 'productos' && products.length === 0) {
			buscarProductos('');
		}
	}, [active]);

	const buscarProductos = (text?: string) => {
		setIsLoading(true);
		fetch(`http://192.168.147.106:3000/menu?search=${text}`)
            .then(res => res.status == 200 ? res.json() : res.text())
            .then((data: string | CartItem[]) => {
				if (typeof data === 'string') {
					showErrorModal(data);
				} else {
					setIsLoading(false);
					setProducts(data);
				}
			})
	}


	return (
		<View style={[styles.main as ViewStyle, { padding: 0 }]}>
			<Text style={[styles.screenTitle as TextStyle, { fontSize: ['xs', 'sm'].includes(mq) ? 50 * rs : 30 * rs }]}>Administración</Text>
			<View style={{ height: 30, maxWidth: '95%', }}>
				<ScrollView contentContainerStyle={adminStyles.sections as ViewStyle} horizontal={true}>
					<View style={adminStyles.section}>
						<Text
							style={[adminStyles.sectionTitle, active == 'pedidos' ? adminStyles.active : null]}
							onPress={() => setActive('pedidos')}
						>
							Pedidos
						</Text>
					</View>
					<View style={adminStyles.section}>
						<Text
							style={[adminStyles.sectionTitle, active == 'productos' ? adminStyles.active : null]}
							onPress={() => setActive('productos')}
						>
							Productos
						</Text>
					</View>
					<View style={adminStyles.lastSection}>
						<Text
							style={[adminStyles.sectionTitle, active == 'usuarios' ? adminStyles.active : null]}
							onPress={() => setActive('usuarios')}
						>
							Usuarios
						</Text>
					</View>
				</ScrollView>
			</View>
			{active == 'productos' && <ProductsAdministration buscar={buscarProductos} products={products} isLoading={isLoading} />}
		</View>
	);
};


const adminStyles = {
	section: {
		borderRightWidth: 2,
		borderRightColor: '#D2C682',
		paddingVertical: 5,
		paddingHorizontal: 20,
	},
	lastSection: {
		paddingVertical: 5,
		paddingHorizontal: 20,
	},
	sectionTitle: {
		color: '#F5F5DC',
		fontFamily: 'Coustard',
	},
	sections: {
		display: 'flex',
		flexDirection: 'row',
		height: 25,
	},
	active: {
		color: '#D2C682',
	},
};
