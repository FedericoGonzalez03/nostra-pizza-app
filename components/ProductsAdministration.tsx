import { CartItem } from "@/app/types/cartTypes";
import { useEffect, useRef, useState, useContext } from "react";
import { Image, ImageStyle, Pressable, ScrollView, Text, TextInput, TextStyle, View, ViewStyle } from "react-native";
import { useMQ, useRH } from "react-native-full-responsive";
import { DataTable, Modal, TextInput as Input, Checkbox } from "react-native-paper";
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import { ErrorContext } from '@/app/_layout';
import { CheckWithLabel } from "./CheckWithLabel";

export default function ProductsAdministration({ products, isLoading, buscar }: { products: CartItem[], isLoading: boolean, buscar: (text?: string) => void }) {
    const [search, setSearch] = useState<string>('');
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
    const [productModalVisible, setProductModalVisible] = useState<boolean>(false);
    const [prodInfo, setProdInfo] = useState<Partial<CartItem>>({});

    const { showErrorModal } = useContext(ErrorContext);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            buscar(search);
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [search]);

    const rh = useRH(1);
    const mq = useMQ();

    const handleRowPress = (id: number) => {
        setSelectedRowId(selectedRowId === id ? null : id);
    };

    const handleDeleteSubmit = () => {
        fetch('http://192.168.147.106:3000/menu/id',
            { method: 'DELETE', body: JSON.stringify({ id: selectedRowId }), headers: { 'Content-Type': 'application/json' } })
            .then(res => res.status == 200 ? res.json() : res.text())
            .then((data: string | object) => {
                if (typeof data === 'string') {
                    showErrorModal('Error eliminando item: ' + data);
                } else {
                    setSelectedRowId(null);
                    setDeleteModalVisible(false);

                    if (search) setSearch('');
                    else buscar();
                }
            });
    };

    const handleModifyClick = () => {
        const selectedProduct = products.find(product => product.id === selectedRowId);
        if (selectedProduct) {
            setProdInfo(selectedProduct);
        }
        setProductModalVisible(true);
    }

    const handleCreateClick = () => {
        setProdInfo({});
        setSelectedRowId(null);
        setProductModalVisible(true);
    }

    const handleProductSubmit = () => {
        const id = prodInfo.id;
        const prod: Partial<CartItem> = {
            name: prodInfo.name,
            description: prodInfo.description,
            price: prodInfo.price,
            available: prodInfo.available,
            image: prodInfo.image,
        };

        if (!prod.name || !prod.description || !prod.price || !prod.image) {
            showErrorModal('Todos los campos son obligatorios');
            return;
        }

        if (id) {
            fetch(`http://192.168.147.106:3000/menu/${id}`,
                { method: 'PUT', body: JSON.stringify(prod), headers: { 'Content-Type': 'application/json' } })
                .then(res => res.status == 200 ? res.json() : res.text())
                .then((data: string | object) => {
                    if (typeof data === 'string') {
                        showErrorModal('Error actualizando item: ' + data);
                    } else {
                        setSelectedRowId(null);
                        setProductModalVisible(false);

                        if (search) setSearch('');
                        else buscar();
                    }
                });
        } else {
            fetch('http://192.168.147.106:3000/menu',
                { method: 'POST', body: JSON.stringify(prod), headers: { 'Content-Type': 'application/json' } })
                .then(res => res.status == 201 ? res.json() : res.text())
                .then((data: string | object) => {
                    if (typeof data === 'string') {
                        showErrorModal('Error creando item: ' + data);
                    } else {
                        setSelectedRowId(null);
                        setProductModalVisible(false);

                        if (search) setSearch('');
                        else buscar();
                    }
                });
        }
    }

    const pickImage = () => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            includeBase64: true,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log("Selección de imágen cancelada");
            } else if (response.errorCode) {
                showErrorModal('Error seleccionando imágen: ' + response.errorCode + ' ' + response.errorMessage);
            } else if (response.assets) {
                const image = response.assets[0];
                if (image.base64) {
                    setProdInfo(prod => ({ ...prod, image: image.base64 }));
                }
            }
        });
    };


    return (
        <>
            <View style={['xs', 'sm'].includes(mq) ? adminStyles.oneColumn as ViewStyle : adminStyles.twoColumns as ViewStyle}>
                <DataTable style={adminStyles.table as ViewStyle}>
                    <TextInput
                        value={search}
                        style={adminStyles.input as TextStyle}
                        onChangeText={(text) => setSearch(text)}
                        placeholder="Buscar por nombre o descripción"
                        placeholderTextColor={'#F5F5DC'}
                    />
                    <DataTable.Header style={{ width: '100%', borderBottomColor: '#EED3' }}>
                        <DataTable.Title style={{ flex: 1 }} textStyle={adminStyles.tableHeaderText as TextStyle}>
                            Id
                        </DataTable.Title>
                        <DataTable.Title style={{ flex: 3 }} textStyle={adminStyles.tableHeaderText as TextStyle}>
                            Nombre
                        </DataTable.Title>
                        <DataTable.Title style={{ flex: 3 }} textStyle={adminStyles.tableHeaderText as TextStyle}>
                            Descripción
                        </DataTable.Title>
                        <DataTable.Title style={{ flex: 2 }} textStyle={adminStyles.tableHeaderText as TextStyle}>
                            Precio
                        </DataTable.Title>
                        <DataTable.Title style={{ flex: 2 }} textStyle={adminStyles.tableHeaderText as TextStyle}>
                            Disponible
                        </DataTable.Title>
                        <DataTable.Title style={{ flex: 1 }} textStyle={adminStyles.tableHeaderText as TextStyle}>
                            Imágen
                        </DataTable.Title>
                    </DataTable.Header>

                    {isLoading &&
                        <View style={{ display: 'flex', height: 200, width: "100%", justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#D2C682', fontFamily: 'Coustard', fontSize: 24 }}>Cargando...</Text>
                        </View>
                    }
                    {!isLoading &&
                        <ScrollView style={{ height: ['xs', 'sm'].includes(mq) ? 35 * rh : 65 * rh }}>
                            {products.map((product, i) => (
                                <DataTable.Row key={product.id}
                                    onPress={() => handleRowPress(product.id)}
                                    style={selectedRowId === product.id ? adminStyles.selectedRow : { borderBottomColor: '#EED3' }}
                                >
                                    <DataTable.Cell style={{ flex: 1 }}><Text style={adminStyles.tableText as TextStyle}>{product.id}</Text></DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 3 }}><Text style={adminStyles.tableText as TextStyle}>{product.name}</Text></DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 3 }}><Text style={adminStyles.tableText as TextStyle}>{product.description}</Text></DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 2 }}><Text style={adminStyles.tableText as TextStyle}>${product.price}</Text></DataTable.Cell>
                                    <DataTable.Cell style={{ flex: 2 }}><Text style={adminStyles.tableText as TextStyle}>{product.available ? 'Sí' : 'No'}</Text></DataTable.Cell>
                                    <DataTable.Cell style={adminStyles.tableImage as ViewStyle}>
                                        <Image
                                            source={{ uri: `data:image/jpeg;base64,${product.image}` }}
                                            style={{ width: 40, height: 40 } as ImageStyle}
                                        />
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </ScrollView>
                    }
                </DataTable>
                <View style={adminStyles.actions as ViewStyle}>
                    <Pressable style={(!selectedRowId ? adminStyles.activeActionButton : adminStyles.actionButton) as ViewStyle} onPress={() => handleCreateClick()}>
                        <Text style={(!selectedRowId ? adminStyles.activeActionButtonText : adminStyles.actionButtonText) as TextStyle}>
                            Crear
                        </Text>
                    </Pressable>
                    <Pressable disabled={!selectedRowId} style={(selectedRowId ? adminStyles.activeActionButton : adminStyles.actionButton) as ViewStyle} onPress={() => handleModifyClick()}>
                        <Text style={(selectedRowId ? adminStyles.activeActionButtonText : adminStyles.actionButtonText) as TextStyle}>
                            Modificar
                        </Text>
                    </Pressable>
                    <Pressable disabled={!selectedRowId} style={adminStyles.dangerActionButton as ViewStyle} onPress={() => setDeleteModalVisible(true)}>
                        <Text style={adminStyles.dangerActionButtonText as TextStyle}>
                            Eliminar
                        </Text>
                    </Pressable>
                </View>
            </View>
            <Modal onDismiss={() => setProductModalVisible(false)} style={adminStyles.modal as ViewStyle} visible={productModalVisible}>
                <View style={adminStyles.modalContainer as ViewStyle}>
                    <TextInput placeholder="Nombre *" style={adminStyles.input as ViewStyle}
                        placeholderTextColor={'#F5F5DC'}
                        value={prodInfo.name}
                        onChangeText={(text) => setProdInfo(prod => ({ ...prod, name: text }))} />
                    <TextInput placeholder="Descripción *" style={adminStyles.input as ViewStyle}
                        placeholderTextColor={'#F5F5DC'}
                        value={prodInfo.description}
                        onChangeText={(text) => setProdInfo(prod => ({ ...prod, description: text }))} />
                    <TextInput keyboardType="numeric" placeholder="Precio *" style={adminStyles.input as ViewStyle}
                        placeholderTextColor={'#F5F5DC'}
                        value={String(prodInfo.price ?? '')}
                        onChangeText={(text) => setProdInfo(prod => {
                            const num = ['undefined', 'NaN', ''].includes(text) ? undefined : Number.parseInt(text);
                            return ({ ...prod, price: num })
                        })} />
                    <Pressable onPress={() => setProdInfo(prod => ({ ...prod, available: !prod.available }))} style={{ width: '100%' }}>
                        <CheckWithLabel label={() => prodInfo.available ? "Disponible" : "No disponible"} checked={prodInfo.available ?? false} size={15} disabled={false} />
                    </Pressable>
                    <Pressable onPress={pickImage} style={adminStyles.actionButton as ViewStyle}>
                        <Text style={adminStyles.actionButtonText as TextStyle}>
                            Seleccionar Imágen *
                        </Text>
                    </Pressable>
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${prodInfo.image}` }}
                        style={{ width: 80, height: 80 } as ImageStyle}
                    />
                    <Pressable style={adminStyles.actionButton as ViewStyle} onPress={() => setProductModalVisible(false)}>
                        <Text style={adminStyles.actionButtonText as TextStyle}>
                            Cancelar
                        </Text>
                    </Pressable>
                    <Pressable style={adminStyles.activeActionButton as ViewStyle} onPress={() => handleProductSubmit()}>
                        <Text style={adminStyles.activeActionButtonText as TextStyle}>
                            Confirmar
                        </Text>
                    </Pressable>
                </View>
            </Modal>
            <Modal onDismiss={() => setDeleteModalVisible(false)} style={adminStyles.modal as ViewStyle} visible={deleteModalVisible}>
                <View style={adminStyles.modalContainer as ViewStyle}>
                    <Text style={adminStyles.modalText as TextStyle}>
                        ¿Está seguro de que desea eliminar este producto?
                    </Text>
                    <Pressable style={adminStyles.actionButton as ViewStyle} onPress={() => setDeleteModalVisible(false)}>
                        <Text style={adminStyles.actionButtonText as TextStyle}>
                            Cancelar
                        </Text>
                    </Pressable>
                    <Pressable style={adminStyles.dangerActionButton as ViewStyle} onPress={() => handleDeleteSubmit()}>
                        <Text style={adminStyles.dangerActionButtonText as TextStyle}>
                            Eliminar
                        </Text>
                    </Pressable>
                </View>
            </Modal>
        </>
    );
}

const adminStyles = {

    table: {
        width: '100%',
    },
    tableText: {
        flexWrap: 'wrap',
        color: '#F5F5DC',
        textAlign: 'center',
        width: '100%',
        fontFamily: 'Coustard',
        fontSize: 12,
        paddingVertical: 5,
    },
    tableHeaderText: {
        color: '#D2C682',
        textAlign: 'center',
        width: '100%',
        fontFamily: 'Coustard',
        fontSize: 16,
    },
    tableImage: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
    },
    twoColumns: {
        display: 'grid',
        width: '90%',
        gap: 20,
        gridTemplateColumns: '4fr 1fr',
    },
    oneColumn: {
        display: 'flex',
        flexDirection: 'column',
        width: '90%',
        gap: 20,
        justifyContent: 'center',
    },
    input: {
        width: '100%',
        height: 40,
        color: '#F5F5DC',
        fontFamily: 'Coustard',
        fontSize: 16,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#EED3',
    },
    selectedRow: {
        backgroundColor: '#DC83',
        borderBottomColor: '#EED3',
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: 20,
        width: '100%',
    },
    activeActionButton: {
        width: '100%',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#D2C682',
    },
    activeActionButtonText: {
        color: '#181815',
        fontFamily: 'Coustard',
        fontSize: 16,
        textAlign: 'center',
    },
    dangerActionButton: {
        width: '100%',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#9F1A1A',
    },
    dangerActionButtonText: {
        color: '#F5F5DC',
        fontFamily: 'Coustard',
        fontSize: 16,
        textAlign: 'center',
    },
    actionButton: {
        width: '100%',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#F5F5DC',
    },
    actionButtonText: {
        color: '#181815',
        fontFamily: 'Coustard',
        fontSize: 16,
        textAlign: 'center',
    },
    modal: {
        width: '80%',
        marginLeft: '10%',
    },
    modalContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 20,
        backgroundColor: '#181815',
        borderRadius: 5,
    },
    modalText: {
        color: '#F5F5DC',
        fontFamily: 'Coustard',
        fontSize: 16,
        textAlign: 'center',
    }
}