/* eslint-disable react-native/no-raw-text */
import { CartItem } from '@/app/types/cartTypes'
import { useEffect, useState, useContext } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageStyle,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { useMQ, useRH, useRS } from 'react-native-full-responsive'
import { DataTable, Modal, Portal } from 'react-native-paper'
import {
  ImageLibraryOptions,
  launchImageLibrary,
} from 'react-native-image-picker'
import { ErrorContext } from '@/app/_layout'
import { CheckWithLabel } from '../CheckWithLabel'
import adminStyles from './adminStyles'
import { SelectList } from 'react-native-dropdown-select-list'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { FONT_SIZES } from '../Constants'

declare type TFlavourGroup = {
  id: number
  grp_title: string
}

declare type ItemWithFlavourGroups = CartItem & {
  flavourGroups: Partial<
    TFlavourGroup & {
      maxQuantity: number
    }
  >[]
}

export default function ProductsAdministration() {
  const [search, setSearch] = useState<string>('')
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [productModalVisible, setProductModalVisible] = useState<boolean>(false)
  const [prodInfo, setProdInfo] = useState<Partial<ItemWithFlavourGroups>>({})
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [products, setProducts] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [flavourGroups, setFlavourGroups] = useState<TFlavourGroup[]>([])

  const { showErrorModal } = useContext(ErrorContext)
  const rh = useRH(1)
  const mq = useMQ()
  const rs = useRS(1);

  const screenHeight = Dimensions.get('window').height;

  const syncGroups = () => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/flavours/groups`)
      .then(res => (res.status == 200 ? res.json() : res.text()))
      .then((data: string | TFlavourGroup[]) => {
        if (typeof data === 'string') {
          showErrorModal(data)
        } else {
          setFlavourGroups(data)
        }
      })
  }

  useEffect(() => {
    syncGroups()
  }, [])

  const buscarProductos = (text?: string) => {
    setIsLoading(true)
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/menu?search=${text ?? ''}`)
      .then(res => (res.status == 200 ? res.json() : res.text()))
      .then((data: string | CartItem[]) => {
        if (typeof data === 'string') {
          setIsLoading(false)
          showErrorModal(data)
        } else {
          setIsLoading(false)
          setProducts(data)
        }
      })
  }

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      buscarProductos(search)
    }, 500)
    return () => clearTimeout(delayedSearch)
  }, [search])

  const handleRowPress = (id: number) => {
    setSelectedRowId(selectedRowId === id ? null : id)
  }

  const handleDeleteSubmit = () => {
    try {
      setIsUploading(true)
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/menu/${selectedRowId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => (res.status == 200 ? res.json() : res.text()))
        .then((data: string | object) => {
          if (typeof data === 'string') {
            showErrorModal('Error eliminando item: ' + data)
          } else {
            setSelectedRowId(null)
            setDeleteModalVisible(false)

            if (search) setSearch('')
            else buscarProductos()
          }
          setIsUploading(false)
        })
    } catch (error) {
      showErrorModal('Error eliminando item: ' + error)
      setIsUploading(false)
    }
  }

  const handleModifyClick = () => {
    const selectedProduct = products.find(
      product => product.id === selectedRowId,
    )
    if (selectedProduct) {
      setProdInfo(selectedProduct)
    }
    setProductModalVisible(true)
  }

  const handleCreateClick = () => {
    setProdInfo({
      flavourGroups: [{}],
      image: `https://res.cloudinary.com/${process.env.EXPO_PUBLIC_CLOUD_NAME}/image/upload/v1731090529/nostrapizza-logo`,
    })
    setSelectedRowId(null)
    setProductModalVisible(true)
  }

  const handleProductSubmit = async () => {
    let id = prodInfo.id
    try {
      setIsUploading(true)

      const prod: Partial<CartItem> = {
        name: prodInfo.name,
        description: prodInfo.description,
        price: prodInfo.price,
        available: prodInfo.available,
        image: prodInfo.image,
      }

      if (!prod.name || !prod.description || !prod.price || !prodInfo.image) {
        showErrorModal('Todos los campos son obligatorios')
        setIsUploading(false)
        return
      }

      if (!prod.image?.includes('https://res.cloudinary.com/')) {
        const uploaded = await uploadImageToCld(prod)
        if (!uploaded) {
          setIsUploading(false)
          return
        }
      }

      const menuApiUrl = id
        ? `${process.env.EXPO_PUBLIC_API_URL}/menu/${id}`
        : `${process.env.EXPO_PUBLIC_API_URL}/menu`

      const menuMethod = id ? 'PUT' : 'POST'

      await fetch(menuApiUrl, {
        method: menuMethod,
        body: JSON.stringify(prod),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res =>
          res.status === (id ? 200 : 201) ? res.json() : res.text(),
        )
        .then((data: string | object) => {
          if (typeof data === 'string') {
            showErrorModal(
              `Error ${id ? 'actualizando' : 'creando'} item: ` + data,
            )
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            id = (data as any).id;
          }
        })

      const flavourGroups = []
      for (const fg of prodInfo.flavourGroups || []) {
        if (fg.id && fg.maxQuantity) {
          flavourGroups.push({
            flavour_grp_id: fg.id,
            max_quantity: fg.maxQuantity,
            menu_id: id,
          })
        }
      }

      const flavoursApiUrl = id
        ? `${process.env.EXPO_PUBLIC_API_URL}/menu/flavours/${id}`
        : `${process.env.EXPO_PUBLIC_API_URL}/menu/flavours`
      const flavoursMethod = id ? 'PUT' : 'POST'

      fetch(flavoursApiUrl, {
        method: flavoursMethod,
        body: JSON.stringify(flavourGroups),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res =>
          res.status === (id ? 200 : 201) ? res.json() : res.text(),
        )
        .then((data: string | object) => {
          if (typeof data === 'string') {
            showErrorModal(
              `Error ${id ? 'actualizando' : 'creando'} los grupos de gustos: ` +
                data,
            )
          } else {
            setSelectedRowId(null)
            setProductModalVisible(false)
            if (search) setSearch('')
            else buscarProductos()
          }
          setIsUploading(false)
        })
    } catch (error) {
      showErrorModal(
        `Error al ${id ? 'actualizar' : 'crear'} el item: ` + error,
      )
      setIsUploading(false)
    }
  }

  const uploadImageToCld = async (prod: Partial<CartItem>) => {
    try {
      const payload = {
        file: `data:image/jpeg;base64,${prod.image}`,
        upload_preset: process.env.EXPO_PUBLIC_CLOUD_PRESET!,
        folder: 'menu',
        public_id:
          Date.now().toString() + '_' + Math.random().toString(36).substring(7),
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      const result = await response.json()

      if (response.ok) {
        prod.image = result.secure_url
        return true
      } else {
        throw new Error(result.error?.message || 'Failed to upload image')
      }
    } catch (error) {
      showErrorModal('Error uploading image to Cloudinary: ' + error)
      return false
    }
  }

  const pickImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
      selectionLimit: 1,
    }
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('Selección de imágen cancelada')
      } else if (response.errorCode) {
        showErrorModal(
          'Error seleccionando imágen: ' +
            response.errorCode +
            ' ' +
            response.errorMessage,
        )
      } else if (response.assets) {
        const image = response.assets[0]
        const base64 = image.base64
        if (base64) {
          setProdInfo(prod => ({ ...prod, image: base64 }))
        } else {
          showErrorModal('Error al leer la imagen')
        }
      }
    })
  }

  return (
    <>
      <View
        style={
          ['xs', 'sm'].includes(mq)
            ? (adminStyles.oneColumn as ViewStyle)
            : (adminStyles.twoColumns as ViewStyle)
        }
      >
        <DataTable style={adminStyles.table as ViewStyle}>
          <TextInput
            value={search}
            style={adminStyles.input as TextStyle}
            onChangeText={text => setSearch(text)}
            placeholder="Buscar por nombre o descripción"
            placeholderTextColor={'#F5F5DC'}
          />
          <DataTable.Header
            style={{ width: '100%', borderBottomColor: '#EED3' }}
          >
            <DataTable.Title
              style={{ flex: 1 }}
              textStyle={adminStyles.tableHeaderText as TextStyle}
            >
              Imágen
            </DataTable.Title>
            <DataTable.Title
              style={{ flex: 1 }}
              textStyle={adminStyles.tableHeaderText as TextStyle}
            >
              Id
            </DataTable.Title>
            <DataTable.Title
              style={{ flex: 3 }}
              textStyle={adminStyles.tableHeaderText as TextStyle}
            >
              Nombre
            </DataTable.Title>
            <DataTable.Title
              style={{ flex: 3 }}
              textStyle={adminStyles.tableHeaderText as TextStyle}
            >
              Descripción
            </DataTable.Title>
            <DataTable.Title
              style={{ flex: 2 }}
              textStyle={adminStyles.tableHeaderText as TextStyle}
            >
              Precio
            </DataTable.Title>
            <DataTable.Title
              style={{ flex: 2 }}
              textStyle={adminStyles.tableHeaderText as TextStyle}
            >
              Disponible
            </DataTable.Title>
          </DataTable.Header>

          {isLoading && (
            <View
              style={{
                display: 'flex',
                height: 50,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator color={'#D2C682'} />
            </View>
          )}
          {!isLoading && (
            <ScrollView
              style={{ height: ['xs', 'sm'].includes(mq) ? 35 * rh : 65 * rh }}
            >
              {products.map((product, i) => (
                <DataTable.Row
                  key={product.id}
                  onPress={() => handleRowPress(product.id)}
                  style={
                    selectedRowId === product.id
                      ? adminStyles.selectedRow
                      : { borderBottomColor: '#EED3' }
                  }
                >
                  <DataTable.Cell style={adminStyles.tableImage as ViewStyle}>
                    <Image
                      source={{ uri: product.image }}
                      style={{ maxWidth: 40, maxHeight: 40, width: '100%', height: '100%' } as ImageStyle}
                    />
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 1 }}>
                    <Text style={[adminStyles.tableText as TextStyle, {fontSize: Math.min((FONT_SIZES.small - 5) * rs, FONT_SIZES.small - 5)}]}>
                      {product.id}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 3 }}>
                    <Text style={[adminStyles.tableText as TextStyle, {fontSize: Math.min((FONT_SIZES.small - 5) * rs, FONT_SIZES.small - 5)}]}>
                      {product.name}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 3 }}>
                    <Text style={[adminStyles.tableText as TextStyle, {fontSize: Math.min((FONT_SIZES.small - 5) * rs, FONT_SIZES.small - 5)}]}>
                      {product.description}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 2 }}>
                    <Text style={[adminStyles.tableText as TextStyle, {fontSize: Math.min((FONT_SIZES.small - 5) * rs, FONT_SIZES.small - 5)}]}>
                      ${product.price}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 2 }}>
                    <Text style={[adminStyles.tableText as TextStyle, {fontSize: Math.min((FONT_SIZES.small - 5) * rs, FONT_SIZES.small - 5)}]}>
                      {product.available ? 'Sí' : 'No'}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </ScrollView>
          )}
        </DataTable>
        <View style={adminStyles.actions as ViewStyle}>
          <Pressable
            style={
              (!selectedRowId
                ? adminStyles.activeActionButton
                : adminStyles.actionButton) as ViewStyle
            }
            onPress={() => handleCreateClick()}
          >
            <Text
              style={
                (!selectedRowId
                  ? adminStyles.activeActionButtonText
                  : adminStyles.actionButtonText) as TextStyle
              }
            >
              Crear
            </Text>
          </Pressable>
          <Pressable
            disabled={!selectedRowId}
            style={
              (selectedRowId
                ? adminStyles.activeActionButton
                : adminStyles.actionButton) as ViewStyle
            }
            onPress={() => handleModifyClick()}
          >
            <Text
              style={
                (selectedRowId
                  ? adminStyles.activeActionButtonText
                  : adminStyles.actionButtonText) as TextStyle
              }
            >
              Modificar
            </Text>
          </Pressable>
          <Pressable
            disabled={!selectedRowId}
            style={adminStyles.dangerActionButton as ViewStyle}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={adminStyles.dangerActionButtonText as TextStyle}>
              Eliminar
            </Text>
          </Pressable>
        </View>
      </View>
      <Modal
        onDismiss={() => setProductModalVisible(false)}
        style={[adminStyles.modal as ViewStyle, {maxHeight: screenHeight * 0.9}]}
        visible={productModalVisible}
      >
        <ScrollView
          style={{maxHeight: screenHeight * 0.9}}
          contentContainerStyle={adminStyles.modalContainer as ViewStyle}
        >
          <TextInput
            placeholder="Nombre *"
            style={adminStyles.input as TextStyle}
            placeholderTextColor={'#F5F5DC'}
            value={prodInfo.name ?? ''}
            onChangeText={text =>
              setProdInfo(prod => ({ ...prod, name: text }))
            }
          />
          <TextInput
            placeholder="Descripción *"
            style={adminStyles.input as TextStyle}
            placeholderTextColor={'#F5F5DC'}
            value={prodInfo.description ?? ''}
            onChangeText={text =>
              setProdInfo(prod => ({ ...prod, description: text }))
            }
          />
          <TextInput
            keyboardType="numeric"
            placeholder="Precio *"
            style={adminStyles.input as TextStyle}
            placeholderTextColor={'#F5F5DC'}
            value={String(prodInfo.price ?? '')}
            onChangeText={text =>
              setProdInfo(prod => {
                const num = ['undefined', 'NaN', ''].includes(text)
                  ? undefined
                  : Number.parseInt(text)
                return { ...prod, price: num }
              })
            }
          />
          <Pressable
            onPress={() =>
              setProdInfo(prod => ({ ...prod, available: !prod.available }))
            }
            style={{ width: '100%' }}
          >
            <CheckWithLabel
              label={() =>
                prodInfo.available ? 'Disponible' : 'No disponible'
              }
              checked={prodInfo.available ?? false}
              size={16}
              disabled={false}
            />
          </Pressable>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 20,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'flex-start',
            }}
          >
            <Image
              source={{
                uri: prodInfo.image?.includes('https://res.cloudinary.com/')
                  ? prodInfo.image
                  : `data:image/jpeg;base64,${prodInfo.image}`,
              }}
              style={{ width: 100, height: 100 } as ImageStyle}
            />
            <Pressable
              onPress={pickImage}
              style={[adminStyles.actionButton as ViewStyle, { width: 'auto' }]}
            >
              <Text style={adminStyles.actionButtonText as TextStyle}>
                Seleccionar Imágen *
              </Text>
            </Pressable>
          </View>
          {prodInfo.flavourGroups &&
            prodInfo.flavourGroups.map((fg, i) => (
              <View key={i} style={{ width: '100%', display: 'flex', gap: 5 }}>
                <View style={{ width: '100%' }}>
                  <SelectList
                    placeholder="Grupo de gustos / opciones"
                    inputStyles={adminStyles.selectInput as TextStyle}
                    boxStyles={adminStyles.selectBox as ViewStyle}
                    data={flavourGroups.map(g => ({
                      value: g.grp_title,
                      key: g.id,
                    }))}
                    dropdownStyles={{ maxHeight: 200, width: '100%' }}
                    dropdownTextStyles={{ color: '#F5F5DC' }}
                    searchPlaceholder="Buscar grupo..."
                    notFoundText="No se encontraron grupos"
                    defaultOption={{
                      key: flavourGroups.find(g => g.id === fg.id)?.id,
                      value: flavourGroups.find(g => g.id === fg.id)?.grp_title,
                    }}
                    setSelected={(opt: number) => {
                      if (opt)
                        setProdInfo(prod => ({
                          ...prod,
                          flavourGroups: prod.flavourGroups?.map((f, idx) =>
                            idx === i ? { ...f, id: opt } : f,
                          ),
                        }))
                    }}
                  />
                </View>
                <TextInput
                  keyboardType="numeric"
                  placeholder="Cantidad máxima"
                  style={adminStyles.input as TextStyle}
                  placeholderTextColor={'#F5F5DC'}
                  value={String(fg.maxQuantity ?? '')}
                  onChangeText={text =>
                    setProdInfo(prod => {
                      const num = ['undefined', 'NaN', ''].includes(text)
                        ? undefined
                        : Number.parseInt(text)
                      return {
                        ...prod,
                        flavourGroups: prod.flavourGroups?.map((f, idx) =>
                          idx === i ? { ...f, maxQuantity: num } : f,
                        ),
                      }
                    })
                  }
                />
              </View>
            ))}
          <View
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              gap: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Pressable
              style={{ alignSelf: 'flex-start' }}
              onPress={() =>
                setProdInfo(prod => {
                  if (!prod.flavourGroups)
                    return { ...prod, flavourGroups: [{}] }
                  const lastAdded =
                    prod.flavourGroups[prod.flavourGroups.length - 1]
                  if (lastAdded && lastAdded.id && lastAdded.maxQuantity)
                    return {
                      ...prod,
                      flavourGroups: [...prod.flavourGroups, {}],
                    }
                  else {
                    showErrorModal(
                      'Por favor, complete los campos del grupo anterior antes de agregar uno nuevo',
                    )
                    return prod
                  }
                })
              }
            >
              <Ionicons
                name="add"
                style={
                  [
                    adminStyles.actionButton,
                    { color: '#181815', fontSize: 24, maxWidth: 100 },
                  ] as unknown as TextStyle
                }
              />
            </Pressable>
            <Pressable
              style={{ alignSelf: 'flex-start' }}
              disabled={
                prodInfo.flavourGroups && prodInfo.flavourGroups.length === 1
              }
              onPress={() =>
                setProdInfo(prod => {
                  if (prod.flavourGroups && prod.flavourGroups.length > 1)
                    return {
                      ...prod,
                      flavourGroups: prod.flavourGroups.slice(0, -1),
                    }
                  else {
                    return prod
                  }
                })
              }
            >
              <Ionicons
                name="remove"
                style={
                  [
                    adminStyles.actionButton,
                    { color: '#181815', fontSize: 24, maxWidth: 100 },
                  ] as unknown as TextStyle
                }
              />
            </Pressable>
          </View>
          <Pressable
            style={adminStyles.actionButton as ViewStyle}
            onPress={() => setProductModalVisible(false)}
          >
            <Text style={adminStyles.actionButtonText as TextStyle}>
              Cancelar
            </Text>
          </Pressable>
          <Pressable
            style={adminStyles.activeActionButton as ViewStyle}
            onPress={() => handleProductSubmit()}
          >
            <Text style={adminStyles.activeActionButtonText as TextStyle}>
              Confirmar
            </Text>
          </Pressable>
        </ScrollView>
      </Modal>
      <Modal
        onDismiss={() => setDeleteModalVisible(false)}
        style={[adminStyles.modal as ViewStyle, {maxHeight: screenHeight * 0.7}]}
        visible={deleteModalVisible}
      >
        <View style={adminStyles.modalContainer as ViewStyle}>
          <Text style={adminStyles.modalText as TextStyle}>
            ¿Está seguro de que desea eliminar este producto?
          </Text>
          <Pressable
            style={adminStyles.actionButton as ViewStyle}
            onPress={() => setDeleteModalVisible(false)}
          >
            <Text style={adminStyles.actionButtonText as TextStyle}>
              Cancelar
            </Text>
          </Pressable>
          <Pressable
            style={adminStyles.dangerActionButton as ViewStyle}
            onPress={() => handleDeleteSubmit()}
          >
            <Text style={adminStyles.dangerActionButtonText as TextStyle}>
              Eliminar
            </Text>
          </Pressable>
        </View>
      </Modal>
      <Portal>
        <View
          style={isUploading ? (adminStyles.loadingPortal as ViewStyle) : {}}
        >
          <ActivityIndicator animating={isUploading} />
        </View>
      </Portal>
    </>
  )
}
