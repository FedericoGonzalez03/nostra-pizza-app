import { FlatList, Pressable, Text, TextStyle, View, ViewStyle } from "react-native";
import { styles } from "../styles";
import { useMQ, useRS } from "react-native-full-responsive";
import { RootState } from "../store";
import { useSelector } from "react-redux";
import ProductFlavours from "@/components/ProductFlavours";
import { useContext, useEffect, useState } from "react";
import { ErrorContext } from "../_layout";

export default function Cart() {

    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [itemsWithFlavours, setItemsWithFlavours] = useState<any[]>([]);

    const mq = useMQ();
    const rs = useRS(1);

    const { showErrorModal } = useContext(ErrorContext);

    const cart = useSelector((state: RootState) => state.cart);

    useEffect(() => {
        for (const item of cart.items) {
            fetch(`http://192.168.147.106:3000/flavours/${item.id}`)
                .then(res => res.status == 200 ? res.json() : res.text())
                .then((data: string | any[]) => {
                    if (typeof data === 'string') {
                        showErrorModal(data);
                    } else {
                        setItemsWithFlavours(state => [...state, { id: item.id, has: data.length > 0 }]);
                    }
                });
        }
    }, [cart]);

    const hasFlavours = (id: number) => {
        return itemsWithFlavours.find(item => item.id === id)?.has;
    }

    return (
        <View style={{ display: 'flex', backgroundColor: '#181815', alignItems: 'center', height: '100%', justifyContent: "center" }} >
            <Text style={[styles.screenTitle as TextStyle, { fontSize: ['xs', 'sm'].includes(mq) ? 50 * rs : 30 * rs }]}>Carrito</Text>
            {cart.items.length === 0 && <Text style={{ color: '#D2C682', fontFamily: 'Coustard', fontSize: ['xs', 'sm'].includes(mq) ? 40 * rs : 24 * rs }}>No hay productos en el carrito</Text>}
            <FlatList
                style={{ width: "80%", height: "100%" } as ViewStyle}
                data={cart.items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    if (!hasFlavours(item.id)) {
                        return (
                        <View key={item.id} style={cartStyles.itemContainer}>
                            <View style={cartStyles.itemAccordion as ViewStyle} >
                                <Text style={{ color: '#D2C682', fontFamily: 'Coustard', fontSize:['xs', 'sm'].includes(mq) ? 30 * rs : 24 * rs }}> {item.quantity} x </Text>
                                <Text style={{ color: '#D2C682', fontFamily: 'Coustard', fontSize:['xs', 'sm'].includes(mq) ? 30 * rs : 24 * rs, flex: 1 }}>{item.name} </Text>
                                <Text style={{ color: '#D2C682', fontFamily: 'Coustard', fontSize:['xs', 'sm'].includes(mq) ? 30 * rs : 24 * rs }}> ${item.price * item.quantity} </Text>
                            </View>
                        </View>
                        );
                    };
                    return (
                        <>
                            {Array.from({ length: item.quantity }).map((_, index) => {
                                const itemKey = `${item.id}_${index}`;
                                return (
                                    <View key={itemKey} style={cartStyles.itemContainer}>
                                        <Pressable style={cartStyles.itemAccordion as ViewStyle} onPress={() => setEditingItem(editingItem === itemKey ? null : itemKey)}>
                                            <Text style={{ color: '#D2C682', fontFamily: 'Coustard', fontSize:['xs', 'sm'].includes(mq) ? 30 * rs : 24 * rs, flex: 1 }}>{editingItem === itemKey ? "▲" : "▼"}  {item.name} </Text>
                                            <Text style={{ color: '#D2C682', fontFamily: 'Coustard', fontSize:['xs', 'sm'].includes(mq) ? 30 * rs : 24 * rs }}> ${item.price} </Text>
                                        </Pressable>
                                        <ProductFlavours prodId={item.id} visible={editingItem === itemKey} />
                                    </View>
                                );
                            })}
                        </>
                    );
                }}
            />
        </View>
    );
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
        fontFamily: 'Coustard',
        fontSize: 24
    }
};