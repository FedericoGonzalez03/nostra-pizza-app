import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState, createContext } from 'react'
import 'react-native-reanimated'
import store from './store'
import SignInHeaderSection from '@/components/SignInHeaderSection'
import { Provider } from 'react-redux'
import { FRProvider } from 'react-native-full-responsive'
import {
  // eslint-disable-next-line react-native/split-platform-components
  PermissionsAndroid,
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { styles } from './styles'
import { Modal, Portal, Provider as PaperProvider } from 'react-native-paper'
import React from 'react'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export const ErrorContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showErrorModal: (message: string) => {},
  hideErrorModal: () => {},
})

export const ConfirmContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showConfirmModal: (message: string) => new Promise<boolean>(() => {}),
  hideConfirmModal: () => {},
})

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Coustard: require('../assets/fonts/Coustard-Regular.ttf'),
    CoustardBlack: require('../assets/fonts/Coustard-Black.ttf'),
    Overlock: require('../assets/fonts/Overlock-Regular.ttf'),
    OverlockBlack: require('../assets/fonts/Overlock-Black.ttf'),
  })

  const router = useRouter()

  const [errorModalVisible, setErrorModalVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const showErrorModal = (message: string) => {
    setErrorMessage(message)
    setErrorModalVisible(true)
  }

  const hideErrorModal = () => {
    setErrorModalVisible(false)
    setErrorMessage('')
  }

  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState('')
  const [resolveConfirm, setResolveConfirm] = useState<(value: boolean) => void>(() => {})

  const showConfirmModal = (message: string): Promise<boolean> => {
    setConfirmMessage(message)
    setConfirmModalVisible(true)
    return new Promise<boolean>((resolve) => {
      setResolveConfirm(() => resolve)
    })
  }

  const hideConfirmModal = () => {
    setConfirmModalVisible(false)
    setConfirmMessage('')
    setResolveConfirm(() => {})
  }

  useEffect(() => {
    if (Platform.OS === 'android') {
      const requestPermissions = async () => {
        try {
          const cameraPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'This app needs access to your camera to take photos.',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          )

          const storagePermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission',
              message: 'This app needs access to your storage to read files.',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          )

          if (
            cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
            storagePermission === PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.log('You can use the camera and read storage')
          } else {
            console.log('Camera or storage permission denied')
          }
        } catch (err) {
          console.warn(err)
        }
      }

      requestPermissions()
    }
  }, [])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
      if (Platform.OS == 'web') document.title = "Nostra Pizza";
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={DarkTheme}>
        <PaperProvider>
          <ErrorContext.Provider value={{ showErrorModal, hideErrorModal }}>
            <ConfirmContext.Provider value={{ showConfirmModal, hideConfirmModal }}>
              <FRProvider
                bases={{
                  xs: 400,
                  sm: 800,
                  md: 900,
                  lg: 1200,
                  xl: 1400,
                  '2xl': 1500,
                }}
                type="sm"
              >
                <StatusBar
                  translucent
                  backgroundColor={'transparent'}
                  barStyle={'light-content'}
                />

                <View style={{ display: 'flex', height: '100%' }}>
                  {Platform.OS != 'web' ? (
                    <View
                      style={{
                        height: StatusBar.currentHeight,
                        backgroundColor: '#1f1f1f',
                      }}
                    ></View>
                  ) : null}
                  <View style={[styles.header as ViewStyle, { height: '8%' }]}>
                    <View style={styles.headerBrand as ViewStyle}>
                      <Text
                        onPress={() =>
                          router.navigate(Platform.OS == 'web' ? '/' : '/menu')
                        }
                        style={
                          {
                            ...(styles.headerTitle as object),
                            fontSize: 36,
                            fontFamily: 'OverlockBlack',
                            textWrap: 'nowrap',
                          } as TextStyle
                        }
                      >
                        Nostra Pizza
                      </Text>
                    </View>
                    <SignInHeaderSection />
                  </View>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                    }}
                  >
                    <Stack.Screen
                      name="(tabs)"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="signup"
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                </View>
                <Portal>
                  <Modal
                    visible={errorModalVisible}
                    onDismiss={hideErrorModal}
                    style={modalStyles.modal as ViewStyle}
                  >
                    <View style={modalStyles.modalContainer as ViewStyle}>
                      <Text style={modalStyles.modalText as TextStyle}>
                        {errorMessage}
                      </Text>
                      <Pressable
                        style={modalStyles.closeButton as ViewStyle}
                        onPress={hideErrorModal}
                      >
                        <Text style={modalStyles.closeButtonText as TextStyle}>
                          Cerrar
                        </Text>
                      </Pressable>
                    </View>
                  </Modal>
                  <Modal
                    visible={confirmModalVisible}
                    onDismiss={() => resolveConfirm(false)}
                    style={modalStyles.modal as ViewStyle}
                  >
                    <View style={modalStyles.modalContainer as ViewStyle}>
                      <Text style={modalStyles.modalText as TextStyle}>
                        {confirmMessage}
                      </Text>
                      <View style={modalStyles.buttonContainer as ViewStyle}>
                        
                        <Pressable
                          style={modalStyles.cancelButton as ViewStyle}
                          onPress={() => {
                            resolveConfirm(false)
                            hideConfirmModal()
                          }}
                        >
                          <Text style={modalStyles.cancelButtonText as TextStyle}>
                            Cancelar
                          </Text>
                        </Pressable>
                        <Pressable
                          style={modalStyles.confirmButton as ViewStyle}
                          onPress={() => {
                            resolveConfirm(true)
                            hideConfirmModal()
                          }}
                        >
                          <Text style={modalStyles.confirmButtonText as TextStyle}>
                            Confirmar
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Modal>
                </Portal>
              </FRProvider>
            </ConfirmContext.Provider>
          </ErrorContext.Provider>
        </PaperProvider>
      </ThemeProvider>
    </Provider>
  )
}

const modalStyles = {
  modal: {
    width: '70%',
    maxWidth: 400,
    margin: 'auto',
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
    fontFamily: 'Overlock',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#9F1A1A',
  },
  closeButtonText: {
    color: '#F5F5DC',
    fontFamily: 'Overlock',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    width: '48%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#F5F5DC',
  },
  confirmButtonText: {
    color: '#`181815`',
    fontFamily: 'OverlockBlack',
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    width: '48%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#A11F1F',
  },
  cancelButtonText: {
    color: '#F5F5DC',
    fontFamily: 'Overlock',
    fontSize: 16,
    textAlign: 'center',
  },
}
