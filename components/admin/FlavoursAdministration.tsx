/* eslint-disable react-native/no-raw-text */
import { ErrorContext } from '@/app/_layout'
import { useContext, useEffect, useState } from 'react'
import { useMQ, useRH, useRS } from 'react-native-full-responsive'
import adminStyles from './adminStyles'
import { DataTable, Modal, Portal } from 'react-native-paper'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { CheckWithLabel } from '../CheckWithLabel'
import { SelectList } from 'react-native-dropdown-select-list'
import { FONT_SIZES } from '../Constants'

declare type TFlavour = {
  id: number
  flavour_group_id: number
  flavour_name: string
  available: boolean
}

declare type TFlavourGroup = {
  id: number
  grp_title: string
}

export default function FlavoursAdministration() {
  const [search, setSearch] = useState<string>('')
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [flavours, setFlavours] = useState<TFlavour[]>([])
  const [flavourModalVisible, setFlavourModalVisible] = useState<boolean>(false)
  const [flavourInfo, setFlavourInfo] = useState<Partial<TFlavour>>({})
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [flavourGroups, setFlavourGroups] = useState<TFlavourGroup[]>([])

  const { showErrorModal } = useContext(ErrorContext)
  const mq = useMQ();
  const rh = useRH(1);
  const rs = useRS(1);

  const syncGroups = () => {
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/flavours/groups`)
      .then(res => (res.status == 200 ? res.json() : res.text()))
      .then((data: string | any[]) => {
        if (typeof data === 'string') {
          showErrorModal(data)
        } else {
          setFlavourGroups(data)
        }
      })
  }

  const buscarGustos = (text?: string) => {
    setIsLoading(true)
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/flavours?search=${text ?? ''}`)
      .then(res => (res.status == 200 ? res.json() : res.text()))
      .then((data: string | any[]) => {
        if (typeof data === 'string') {
          setIsLoading(false)
          showErrorModal(data)
        } else {
          setIsLoading(false)
          setFlavours(data)
        }
      })
  }

  useEffect(() => {
    syncGroups()
  }, [])

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      buscarGustos(search)
    }, 500)
    return () => clearTimeout(delayedSearch)
  }, [search])

  const handleRowPress = (id: number) => {
    setSelectedRowId(selectedRowId === id ? null : id)
  }

  const handleCreateClick = () => {
    setFlavourInfo({})
    setFlavourModalVisible(true)
  }

  const handleModifyClick = () => {
    const flavour = flavours.find(f => f.id === selectedRowId)
    if (flavour) {
      setFlavourInfo(flavour)
      setFlavourModalVisible(true)
    }
  }

  const handleFlavourSubmit = () => {
    const flavourId = flavourInfo.id
    const method = flavourId ? 'PUT' : 'POST'
    const url = flavourId
      ? `${process.env.EXPO_PUBLIC_API_URL}/flavours/${flavourId}`
      : `${process.env.EXPO_PUBLIC_API_URL}/flavours`

    setIsUploading(true)
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flavourInfo),
    })
      .then(res =>
        res.status == 200 || res.status == 201 ? res.json() : res.text(),
      )
      .then((data: string | any) => {
        setIsUploading(false)
        if (typeof data === 'string') {
          showErrorModal(data)
        } else {
          setFlavourModalVisible(false)
          buscarGustos()
        }
      })
  }

  const handleDeleteSubmit = () => {
    setIsUploading(true)
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/flavours/${selectedRowId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => (res.status == 200 ? res.json() : res.text()))
      .then((data: string | any) => {
        setIsUploading(false)
        if (typeof data === 'string') {
          showErrorModal(data)
        } else {
          setDeleteModalVisible(false)
          buscarGustos()
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
              Id
            </DataTable.Title>
            <DataTable.Title
              style={{ flex: 3 }}
              textStyle={adminStyles.tableHeaderText as TextStyle}
            >
              Grupo
            </DataTable.Title>
            <DataTable.Title
              style={{ flex: 3 }}
              textStyle={adminStyles.tableHeaderText as TextStyle}
            >
              Nombre
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
              {flavours.map((flavour, i) => (
                <DataTable.Row
                  key={flavour.id}
                  onPress={() => handleRowPress(flavour.id)}
                  style={
                    selectedRowId === flavour.id
                      ? adminStyles.selectedRow
                      : { borderBottomColor: '#EED3' }
                  }
                >
                  <DataTable.Cell style={{ flex: 1 }}>
                    <Text style={[adminStyles.tableText as TextStyle, {fontSize: Math.min((FONT_SIZES.small - 5) * rs, FONT_SIZES.small - 5)}]}>
                      {flavour.id}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 3 }}>
                    <Text style={[adminStyles.tableText as TextStyle, {fontSize: Math.min((FONT_SIZES.small - 5) * rs, FONT_SIZES.small - 5)}]}>
                      {
                        flavourGroups.find(
                          g => g.id === flavour.flavour_group_id,
                        )?.grp_title
                      }
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 3 }}>
                    <Text style={[adminStyles.tableText as TextStyle, {fontSize: Math.min((FONT_SIZES.small - 5) * rs, FONT_SIZES.small - 5)}]}>
                      {flavour.flavour_name}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 2 }}>
                    <Text style={[adminStyles.tableText as TextStyle, {fontSize: Math.min((FONT_SIZES.small - 5) * rs, FONT_SIZES.small - 5)}]}>
                      {flavour.available ? 'Sí' : 'No'}
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
        onDismiss={() => setFlavourModalVisible(false)}
        style={adminStyles.modal as ViewStyle}
        visible={flavourModalVisible}
      >
        <View style={adminStyles.modalContainer as ViewStyle}>
          <View style={{ width: '100%' }}>
            <SelectList
              placeholder="Grupo *"
              inputStyles={adminStyles.selectInput as ViewStyle}
              boxStyles={adminStyles.selectBox as ViewStyle}
              data={flavourGroups.map(g => ({ value: g.grp_title, key: g.id }))}
              dropdownStyles={{ maxHeight: 200, width: '100%' }}
              dropdownTextStyles={{ color: '#F5F5DC' }}
              searchPlaceholder="Buscar grupo..."
              notFoundText="No se encontraron grupos"
              defaultOption={{
                key: flavourGroups.find(
                  g => g.id === flavourInfo.flavour_group_id,
                )?.id,
                value: flavourGroups.find(
                  g => g.id === flavourInfo.flavour_group_id,
                )?.grp_title,
              }}
              setSelected={(opt: any) => {
                if (opt)
                  setFlavourInfo(flv => ({ ...flv, flavour_group_id: opt }))
              }}
            />
          </View>
          <TextInput
            placeholder="Nombre *"
            style={adminStyles.input as ViewStyle}
            placeholderTextColor={'#F5F5DC'}
            value={flavourInfo.flavour_name ?? ''}
            onChangeText={text =>
              setFlavourInfo(flv => ({ ...flv, flavour_name: text }))
            }
          />
          <Pressable
            onPress={() =>
              setFlavourInfo(flv => ({ ...flv, available: !flv.available }))
            }
            style={{ width: '100%' }}
          >
            <CheckWithLabel
              label={() =>
                flavourInfo.available ? 'Disponible' : 'No disponible'
              }
              checked={flavourInfo.available ?? false}
              size={15}
              disabled={false}
            />
          </Pressable>
          <Pressable
            style={adminStyles.actionButton as ViewStyle}
            onPress={() => setFlavourModalVisible(false)}
          >
            <Text style={adminStyles.actionButtonText as TextStyle}>
              Cancelar
            </Text>
          </Pressable>
          <Pressable
            style={adminStyles.activeActionButton as ViewStyle}
            onPress={() => handleFlavourSubmit()}
          >
            <Text style={adminStyles.activeActionButtonText as TextStyle}>
              Confirmar
            </Text>
          </Pressable>
        </View>
      </Modal>
      <Modal
        onDismiss={() => setDeleteModalVisible(false)}
        style={adminStyles.modal as ViewStyle}
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
