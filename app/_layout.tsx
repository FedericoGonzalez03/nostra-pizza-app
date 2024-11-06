import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, createContext } from 'react';
import 'react-native-reanimated';
import store from './store';

import { Provider } from 'react-redux';
import { FRProvider } from 'react-native-full-responsive';
import { PermissionsAndroid, Platform, Pressable, StatusBar, Text, TextStyle, View, ViewStyle } from 'react-native';
import { styles } from './styles';
import { Modal, Portal, Provider as PaperProvider } from 'react-native-paper';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const ErrorContext = createContext({
  showErrorModal: (message: string) => { },
  hideErrorModal: () => { },
});

export default function RootLayout() {

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Coustard: require('../assets/fonts/Coustard-Regular.ttf'),
    CoustardBlack: require('../assets/fonts/Coustard-Black.ttf'),
  });

  const router = useRouter();

  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showErrorModal = (message: string) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const hideErrorModal = () => {
    setErrorModalVisible(false);
    setErrorMessage('');
  };

  useEffect(() => {
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
        );

        const storagePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to read files.',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (
          cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
          storagePermission === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('You can use the camera and read storage');
        } else {
          console.log('Camera or storage permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }


  return (
    <Provider store={store}>
      <ThemeProvider value={DarkTheme}>
        <PaperProvider>
          <ErrorContext.Provider value={{ showErrorModal, hideErrorModal }}>
            <FRProvider bases={{
              'xs': 400,
              'sm': 800,
              'md': 900,
              'lg': 1200,
              'xl': 1400,
              '2xl': 1500,
            }}
              type='sm'
            >

              <View style={{ display: 'flex', height: '100%' }} >
                {Platform.OS != 'web' ? <View style={{ height: StatusBar.currentHeight, backgroundColor: '#1f1f1f' }}></View> : null}
                <View style={[styles.header as ViewStyle, { height: '8%' }]}>
                  <View style={styles.headerBrand as ViewStyle}>
                    <Text onPress={() => router.navigate('/')} style={{ ...styles.headerTitle as Object, fontSize: 36 } as TextStyle}>Nostra Pizza</Text>
                  </View>
                </View>
                <Stack screenOptions={{
                  headerShown: false,
                }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>

              </View>
              <Portal>
                <Modal visible={errorModalVisible} onDismiss={hideErrorModal}
                  style={modalStyles.modal as ViewStyle} >
                  <View style={modalStyles.modalContainer as ViewStyle}>
                    <Text style={modalStyles.modalText as TextStyle}>{errorMessage}</Text>
                    <Pressable style={modalStyles.closeButton as ViewStyle} onPress={hideErrorModal}>
                      <Text style={modalStyles.closeButtonText as TextStyle}>
                        Cerrar
                      </Text>
                    </Pressable>
                  </View>
                </Modal>
              </Portal>
            </FRProvider>
          </ErrorContext.Provider>
        </PaperProvider>
      </ThemeProvider>
    </Provider>
  );
}


const modalStyles = {
  modal: {
    width: '70%',
    marginLeft: '15%',
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
  },
  closeButton: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#9F1A1A',
  },
  closeButtonText: {
    color: '#F5F5DC',
    fontFamily: 'Coustard',
    fontSize: 16,
    textAlign: 'center',
  },
};
