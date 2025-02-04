import { ErrorContext } from '@/app/_layout'
import { useContext, useEffect, useState } from 'react'
import { useMQ, useRH } from 'react-native-full-responsive'
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

declare type TFlavourGroup = {
  id: number
  grp_title: string
}

export default function FlavourGroupsAdministration() {
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [flavourGroups, setFlavourGroups] = useState<TFlavourGroup[]>([])
  const [flavourGroupModalVisible, setFlavourGroupModalVisible] =
    useState<boolean>(false)
  const [flavourGroupInfo, setFlavourGroupInfo] = useState<
    Partial<TFlavourGroup>
  >({})
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const { showErrorModal } = useContext(ErrorContext)
  const mq = useMQ()
  const rh = useRH(1)

  const syncGroups = () => {
    setIsLoading(true)
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/flavours/groups`)
      .then(res => (res.status == 200 ? res.json() : res.text()))
      .then((data: string | any[]) => {
        setIsLoading(false)
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

  const handleRowPress = (id: number) => {
    setSelectedRowId(selectedRowId === id ? null : id)
  }

  const handleCreateClick = () => {
    setFlavourGroupInfo({})
    setFlavourGroupModalVisible(true)
  }

  const handleModifyClick = () => {
    const group = flavourGroups.find(g => g.id === selectedRowId)
    if (group) {
      setFlavourGroupInfo(group)
      setFlavourGroupModalVisible(true)
    }
  }

  const handleGroupSubmit = () => {
    const groupId = flavourGroupInfo.id
    const method = groupId ? 'PUT' : 'POST'
    const url = groupId
      ? `${process.env.EXPO_PUBLIC_API_URL}/flavours/groups/${groupId}`
      : `${process.env.EXPO_PUBLIC_API_URL}/flavours/groups`

    setIsUploading(true)
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flavourGroupInfo),
    })
      .then(res =>
        res.status == 200 || res.status == 201 ? res.json() : res.text(),
      )
      .then((data: string | any) => {
        setIsUploading(false)
        if (typeof data === 'string') {
          showErrorModal(data)
        } else {
          setFlavourGroupModalVisible(false)
          syncGroups()
        }
      })
  }

  const handleDeleteSubmit = () => {
    setIsUploading(true)
    fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/flavours/groups/${selectedRowId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
      .then(res => (res.status == 200 ? res.json() : res.text()))
      .then((data: string | any) => {
        setIsUploading(false)
        if (typeof data === 'string') {
          showErrorModal(data)
        } else {
          setDeleteModalVisible(false)
          syncGroups()
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
              Título
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
              {flavourGroups.map((group, i) => (
                <DataTable.Row
                  key={group.id}
                  onPress={() => handleRowPress(group.id)}
                  style={
                    selectedRowId === group.id
                      ? adminStyles.selectedRow
                      : { borderBottomColor: '#EED3' }
                  }
                >
                  <DataTable.Cell style={{ flex: 1 }}>
                    <Text style={adminStyles.tableText as TextStyle}>
                      {group.id}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ flex: 3 }}>
                    <Text style={adminStyles.tableText as TextStyle}>
                      {group.grp_title}
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
        onDismiss={() => setFlavourGroupModalVisible(false)}
        style={adminStyles.modal as ViewStyle}
        visible={flavourGroupModalVisible}
      >
        <View style={adminStyles.modalContainer as ViewStyle}>
          <TextInput
            placeholder="Título *"
            style={adminStyles.input as ViewStyle}
            placeholderTextColor={'#F5F5DC'}
            value={flavourGroupInfo.grp_title ?? ''}
            onChangeText={text =>
              setFlavourGroupInfo(flv => ({ ...flv, grp_title: text }))
            }
          />
          <Pressable
            style={adminStyles.actionButton as ViewStyle}
            onPress={() => setFlavourGroupModalVisible(false)}
          >
            <Text style={adminStyles.actionButtonText as TextStyle}>
              Cancelar
            </Text>
          </Pressable>
          <Pressable
            style={adminStyles.activeActionButton as ViewStyle}
            onPress={() => handleGroupSubmit()}
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
            ¿Está seguro de que desea eliminar este grupo?
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
