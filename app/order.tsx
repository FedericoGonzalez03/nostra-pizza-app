/* eslint-disable react-native/no-raw-text */
import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TextStyle,
  ViewStyle,
  Image,
  TextInput,
  FlexStyle,
  ScrollView,
  Dimensions,
} from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import { styles } from './styles'
import { useMQ, useRS } from 'react-native-full-responsive'
import { openBrowserAsync } from 'expo-web-browser'
import { ErrorContext } from './_layout'
import { DataTable, Modal } from 'react-native-paper'
import adminStyles from '@/components/admin/adminStyles'
import { CheckWithLabel } from '@/components/CheckWithLabel'
import { RadioWithLabel } from '@/components/RadioWithLabel'
import { Ionicons } from '@expo/vector-icons'
import { FONT_SIZES } from '@/components/Constants'
import AddressMap from '@/components/AddressMap'
import * as Location from 'expo-location'
// import MapView, { Marker } from 'react-native-maps';

declare type TOrderDetails = {
  menu_item_id: number
  quantity: number
  unit_price: number
  total: number
  flavours?: number[]
}

declare type TOrder = {
  user_id: number
  pay_method: string
  status: string
  delivery_address: string
  total: number
  details: TOrderDetails
}

declare type TAddress = {
  id: number
  user_id: number
  title: string
  address: string
  additional_references: string
  latitude: number
  longitude: number
}

const getUserAddresses = async (userId: number) => {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/users/addresses/${userId}`,
  )
  const data = await response.json()
  return data
}

export default function Order() {
  const cart = useSelector((state: RootState) => state.cart)
  const auth = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<TOrder | null>(null)
  const [addressModalVisible, setAddressModalVisible] = useState(false)
  const [userAddresses, setUserAddresses] = useState<TAddress[]>([])
  const [address, setAddress] = useState<Partial<TAddress>>({})
  const [useAnotherAddress, setUseAnotherAddress] = useState(false);
  const [anotherAddress, setAnotherAddress] = useState<Partial<TAddress>>({})
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null)
  const [useCash, setUseCash] = useState(false)
  const [useMercadoPago, setUseMercadoPago] = useState(false)
  const [useDLocal, setUseDLocal] = useState(false)

  useEffect(() => {
    if (auth.user) {
      getUserAddresses(auth.user.id!).then((addresses) => {
        setUserAddresses(addresses)
      });
    }
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          showErrorModal('No se permitió el acceso a la ubicación');
          return;
        }
        const location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
        const { latitude, longitude } = location.coords;
        setLocation({ latitude, longitude });
      } catch (error) {
        showErrorModal((error as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [auth.user]);
  
  const { showErrorModal } = useContext(ErrorContext)

  const mq = useMQ()
  const rs = useRS(1)
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    setLoading(false)
  }, [cart])

  const pagoConMercadoPago = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/checkout/mp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: cart.items,
          }),
        },
      )

      if (response.status !== 200) {
        throw new Error('Error al procesar el pago ' + (await response.text()))
      }
      const data = await response.json()

      openBrowserAsync(
        `https://sandbox.mercadopago.com.uy/checkout/v1/redirect?pref_id=${data.id}`,
      )
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const pagoConDLocal = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/checkout/dlocal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: cart.totalAmmount,
          }),
        },
      )
      const data = await response.json()

      await openBrowserAsync(data.url)
    } catch (error) {
      showErrorModal((error as Error).message);
    } finally {
      setLoading(false)
    }
  }

  const pagoConStripe = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/checkout/stripe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: cart.totalAmmount,
          }),
        },
      )
      const data = await response.json()

      await openBrowserAsync(data.url)
    } catch (error) {
      showErrorModal((error as Error).message);
    } finally {
      setLoading(false)
    }
  }

  const handleAddressSubmit = async () => {
    try {
      setLoading(true)
      if (!address || !address.title || !address.address || address.latitude === undefined || address.longitude === undefined) {
        throw new Error('Antes debe completar todos los datos requeridos');
      }
      let method = 'POST';
      let endpoint = `${process.env.EXPO_PUBLIC_API_URL}/users/addresses`;
      if (address.id) {
        method = 'PUT';
        endpoint = `${process.env.EXPO_PUBLIC_API_URL}/users/addresses/${address.id}`;
      }
      const response = await fetch(
        endpoint,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: address.title,
            address: address.address,
            additional_references: address.additional_references,
            latitude: address.latitude,
            longitude: address.longitude,
            user_id: auth.user!.id,
          }),
        },
      )

      if (response.status !== 201 && response.status !== 200) {
        throw new Error('Error al guardar la dirección ' + (await response.text()))
      }
      setAddressModalVisible(false)
    } catch (error) {
      showErrorModal((error as Error).message);
    } finally {
      setLoading(false)
    }
  }

  const addAnAddress = () => {
    setAddress({});
    setAddressModalVisible(true)
  }

  const editAddress = (addr: TAddress) => {
    setAddress(addr);
    setAddressModalVisible(true);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A11F1F" />
      </View>
    )
  }

  return (
    <View
      style={{
        display: 'flex',
        backgroundColor: '#181815',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <ScrollView
        style={{
          display: 'flex',
          width: '100%',
        }}
        contentContainerStyle={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <DataTable style={{ maxWidth: 1000 }}>
          <DataTable.Header>
            <DataTable.Title
                style={{ flex: 1 }}>
              {''}
            </DataTable.Title>
            <DataTable.Title
                style={{ flex: 5 }}
                textStyle={{fontFamily: 'Overlock', fontSize: FONT_SIZES.small * rs, color: '#D2C682'}}
            >
              Producto
            </DataTable.Title>
            <DataTable.Title
                style={{ flex: 2 }}
                textStyle={{textAlign: 'center', fontSize: FONT_SIZES.small * rs, width: '100%', fontFamily: 'Overlock', color: '#D2C682'}}
            >
              $ unitario
            </DataTable.Title>
            <DataTable.Title
                style={{ flex: 1 }}
                textStyle={{textAlign: 'center', fontSize: FONT_SIZES.small * rs, width: '100%', fontFamily: 'Overlock', color: '#D2C682'}}	
            >
              x
            </DataTable.Title>
            <DataTable.Title
                style={{ flex: 2 }}
                textStyle={{textAlign: 'center', fontSize: FONT_SIZES.small * rs, width: '100%', fontFamily: 'Overlock', color: '#D2C682'}}
            >
              subtotal
            </DataTable.Title>
          </DataTable.Header>
          {
            cart.items.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell
                  style={{ flex: 1 }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ height: '100%', width: '90%',}}
                  />
                </DataTable.Cell>
                <DataTable.Cell
                  style={{ flex: 5 }}
                  textStyle={[adminStyles.tableText as TextStyle, {textAlign: 'left', fontSize: (FONT_SIZES.small - 2) * rs}]}
                >
                  {item.name}
                </DataTable.Cell>
                <DataTable.Cell
                  style={{ flex: 2 }}
                  textStyle={[adminStyles.tableText as TextStyle, {fontSize: (FONT_SIZES.small - 2) * rs}]}
                >
                  $ {item.price}
                </DataTable.Cell>
                <DataTable.Cell
                  style={{ flex: 1 }}
                  textStyle={[adminStyles.tableText as TextStyle, {fontSize: (FONT_SIZES.small - 2) * rs}]}
                >
                  {item.quantity}
                </DataTable.Cell>
                <DataTable.Cell
                  style={{ flex: 2 }}
                  textStyle={[adminStyles.tableText as TextStyle, {fontSize: (FONT_SIZES.small - 2) * rs}]}
                >
                  $ {item.price * item.quantity}
                </DataTable.Cell>
              </DataTable.Row>
            ))
          }
          <DataTable.Row>
            <DataTable.Cell
                textStyle={{textAlign: 'center', width: '100%', fontFamily: 'Overlock', color: '#D2C682', fontSize: (FONT_SIZES.medium - 10) * rs}}
            >
              Total: $ {cart.totalAmmount}
            </DataTable.Cell>
          </DataTable.Row>
        </DataTable>
        <Text 
          style={{
            width: '80%',
            maxWidth: 1000,
            fontFamily: 'Overlock',
            color: '#D2C682',
            fontSize: FONT_SIZES.medium * rs,
            marginTop: 20,
          }}
        >
          Dirección de entrega
        </Text>
        <View
          style={{
            display: 'flex',
            width: '80%',
            maxWidth: 1000,
            padding: 10,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {!auth.isGuest && userAddresses.map((addr, index) => (
            <View key={`usr_addr_${index}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <Pressable
                onPress={() => setAddress(addr)}
              >
                <RadioWithLabel checked={addr.id === address.id} label={`${addr.title} — ${addr.address}`} disabled={false} size={FONT_SIZES.small * rs} />
              </Pressable>
              <Pressable
                onPress={() => editAddress(addr)}
              >
                <Ionicons name='create-outline' color={'#D2C682'} size={FONT_SIZES.small * rs}/>
              </Pressable>
            </View>
          ))}
          {!auth.isGuest && 
            <Pressable style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: FONT_SIZES.small * rs }}
              onPress={addAnAddress}  
            >
              <Ionicons name='add' color={'#D2C682'} size={FONT_SIZES.small * 2 * rs}/>
              <Text style={{ color: '#F5F5DC', fontFamily: 'Overlock', fontSize: FONT_SIZES.small * rs }}>Agregar una dirección</Text>
            </Pressable>
          }
          <Pressable onPress={() => {
              setUseAnotherAddress(!useAnotherAddress)
              setAddress({})
          }}>
            <CheckWithLabel checked={useAnotherAddress} label={'Usar otra dirección sin agregar'} disabled={false} size={FONT_SIZES.small * rs}/>
          </Pressable>
          {useAnotherAddress && (
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                width: '100%',
                gap: 20,
                backgroundColor: '#181815',
              }}
            >
              <TextInput
                placeholder="Dirección *"
                style={adminStyles.input as FlexStyle}
                placeholderTextColor={'#F5F5DC'}
                value={anotherAddress?.address ?? ''}
                onChangeText={text =>
                  setAnotherAddress((addr) => ({ ...addr, address: text }))
                }
              />
              <TextInput
                placeholder="Referencias adicionales, como número de apartamento, piso, etc."
                style={adminStyles.input as FlexStyle}
                placeholderTextColor={'#F5F5DC'}
                value={anotherAddress?.additional_references ?? ''}
                onChangeText={text =>
                  setAnotherAddress((addr) => ({...addr, additional_references: text }))
                }
              />
              <AddressMap 
                setLatitude={(lat) => setAnotherAddress((addr) => ({ ...addr, latitude: lat }))}
                setLongitude={(lon) => setAnotherAddress((addr) => ({ ...addr, longitude: lon }))}
                latitude={anotherAddress.latitude ?? location?.latitude ?? 0}
                longitude={anotherAddress.longitude ?? location?.longitude ?? 0}
              />
            </View>
            
            )}
        </View>
        <Text 
          style={{
            width: '80%',
            maxWidth: 1000,
            fontFamily: 'Overlock',
            color: '#D2C682',
            fontSize: FONT_SIZES.medium * rs,
            marginTop: 20,
          }}
        >
          Método de pago
        </Text>
        <View
          style={{
            display: 'flex',
            width: '80%',
            maxWidth: 1000,
            padding: 10,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <Pressable onPress={() => {
            setUseCash(!useCash)
            setUseMercadoPago(false)
            setUseDLocal(false)
          }}>
            <RadioWithLabel checked={useCash} label={'Efectivo'} disabled={false} size={FONT_SIZES.small * rs}/>
          </Pressable>
          <Pressable onPress={() => {
            setUseMercadoPago(!useMercadoPago)
            setUseCash(false)
            setUseDLocal(false)
          }}>
            <RadioWithLabel checked={useMercadoPago} label={'Mercado Pago'} disabled={false} size={FONT_SIZES.small * rs}/>
          </Pressable>
          <Pressable onPress={() => {
            setUseDLocal(!useDLocal)
            setUseCash(false)
            setUseMercadoPago(false)
          }}>
            <RadioWithLabel checked={useDLocal} label={'Débito — Crédito — Redes de cobranza'} disabled={false} size={FONT_SIZES.small * rs}/>
          </Pressable>
        </View>
      </ScrollView>
      <Modal
        onDismiss={() => setAddressModalVisible(false)}
        style={adminStyles.modal as ViewStyle}
        visible={addressModalVisible}
      >
        <ScrollView style={{ flex: 1, maxHeight: screenHeight * 0.8 }}>
          <View style={adminStyles.modalContainer as ViewStyle}>
            <TextInput
              placeholder="Nombre *"
              style={adminStyles.input as FlexStyle}
              placeholderTextColor={'#F5F5DC'}
              value={address?.title ?? ''}
              onChangeText={text =>
                setAddress((addr) => ({ ...addr, title: text }))
              }
            />
            <TextInput
              placeholder="Dirección *"
              style={adminStyles.input as FlexStyle}
              placeholderTextColor={'#F5F5DC'}
              value={address?.address ?? ''}
              onChangeText={text =>
                setAddress((addr) => ({ ...addr, address: text }))
              }
            />
            <TextInput
              placeholder="Referencias adicionales, como número de apartamento, piso, etc."
              style={adminStyles.input as FlexStyle}
              placeholderTextColor={'#F5F5DC'}
              value={address?.additional_references ?? ''}
              onChangeText={text =>
                setAddress((addr) => ({...addr, additional_references: text }))
              }
            />
            <AddressMap 
              setLatitude={(lat) => setAddress((addr) => ({ ...addr, latitude: lat }))}
              setLongitude={(lon) => setAddress((addr) => ({ ...addr, longitude: lon }))}
              latitude={address.latitude ?? location?.latitude ?? 0}
              longitude={address.longitude ?? location?.longitude ?? 0}
            />
            <Pressable
              style={adminStyles.actionButton as ViewStyle}
              onPress={() => setAddressModalVisible(false)}
            >
              <Text style={adminStyles.actionButtonText as TextStyle}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              style={adminStyles.activeActionButton as ViewStyle}
              onPress={handleAddressSubmit}
            >
              <Text style={adminStyles.activeActionButtonText as TextStyle}>
                Confirmar
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Modal>
    </View>
  )
}
