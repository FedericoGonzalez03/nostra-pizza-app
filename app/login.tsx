import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  Platform,
  Pressable,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { login } from './slices/authReducer'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import adminStyles from '@/components/admin/adminStyles'
import { Ionicons } from '@expo/vector-icons'
import Spacer from '@/components/Spacer'
import { FONT_SIZES } from '@/components/Constants'
import { useRS } from 'react-native-full-responsive'
import { ErrorContext } from './_layout'
import { User } from './types/authTypes'



WebBrowser.maybeCompleteAuthSession()
declare type TGoogleUser = {
  id: string
  name: string
  email: string
}

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()
  
  const { showErrorModal } = useContext(ErrorContext);

  const rs = useRS(1);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      '483849855913-tla9htmkaqsi3bnl3fe5d23r8d0tnhlk.apps.googleusercontent.com',
    iosClientId:
      '483849855913-kpni3iu5653dvuhoaruqr4bsjhq4u1t6.apps.googleusercontent.com',
    androidClientId:
      '483849855913-30aslgv3qsc70lk454eersgo8gh7thcn.apps.googleusercontent.com',
    redirectUri: Platform.select({
      web: process.env.EXPO_PUBLIC_THIS_APP_URL,
      ios: 'nostrapizza:/oauthredirect',
      android: 'nostrapizza:/oauthredirect',
    }),
  })

  const handleSignInWithGoogle = async () => {
    if (response?.type === 'success') {
      const { authentication } = response
      if (authentication) {
        const user : TGoogleUser = await getGoogleUserInfo(authentication.accessToken);
        if (!user) return;
        const success = createGoogleUserIfNotExists(user);
        if (!success) return;
        const userToDispatch = await getUser({google_id: user.id});
        if (userToDispatch && userToDispatch.id) {
          dispatch(login(userToDispatch))
        }
      }
    }
  }

  const createGoogleUserIfNotExists = async (user: TGoogleUser): Promise<boolean> => {
    const exists = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/google/${user.id}`);
    if (exists.status !== 404) return true;
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/signup/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({...user, google_id: user.id, phone: null}),
    });
    if (response.status !== 200) {
      showErrorModal('Error creando usuario con Google');
      return false;
    } else {
      return true;
    }
  }

  const getUser = async (user: Partial<User>): Promise<Partial<User>> => {
    let userEndpointUrl = `${process.env.EXPO_PUBLIC_API_URL}/users/`;
    if (user.google_id) {
      userEndpointUrl += `google/${user.google_id}`;
    } else {
      userEndpointUrl += user.id;
    }
    try {
      const response = await fetch(userEndpointUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const user = await response.json();
        AsyncStorage.setItem('@user', JSON.stringify(user));
        return user;
      } else {
        const errorText = await response.text();
        showErrorModal(errorText);
        return {};
      }
    } catch (error) {
      console.error("Error obteniendo datos del usuario", error);
      showErrorModal(error!.toString());
      return {};
    }
  }


  const getGoogleUserInfo = async (accessToken: string) => {
    if (!accessToken) return
    try {
      const response = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      return await response.json()
    } catch (error) {
      showErrorModal(error!.toString())
    }
  }

  const emailLogin = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      if (response.status !== 200) {
        showErrorModal('Usuario o contraseña incorrectos')
        return
      }
      const data = await response.json()
      const user = await getUser({id: data.userId});
      dispatch(login(user));
    } catch (error) {
      showErrorModal(error!.toString())
    }
  }

  const signInAnonymously = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/-1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.status !== 200) {
        showErrorModal('Error al ingresar como invitado')
        return
      }
      const data = await response.json()
      dispatch(login(data))
    } catch (error) {
      showErrorModal(error!.toString())
    }
  }

  useEffect(() => {
    handleSignInWithGoogle()
  }, [response])

  return (
    <View
      style={{
        display: 'flex',
        backgroundColor: '#181815',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '70%',
          justifyContent: 'center',
        }}
      >
        <TextInput
          placeholder="Correo"
          style={[adminStyles.input as TextStyle, {fontSize: Math.max(FONT_SIZES.small * rs, 16), height: FONT_SIZES.large * rs, minHeight: 30}]}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={'#F5F5DC'}
        />
        <Spacer />
        <TextInput
          placeholder="Contraseña"
          style={[adminStyles.input as TextStyle, {fontSize: Math.max(FONT_SIZES.small * rs, 16), height: FONT_SIZES.large * rs, minHeight: 30}]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={'#F5F5DC'}
        />
        <Spacer />

        <Pressable
          style={adminStyles.activeActionButton as ViewStyle}
          onPress={emailLogin}
        >
          <Text style={adminStyles.activeActionButtonText as TextStyle}>
            Ingresar
          </Text>
        </Pressable>
        <Spacer />
        {/* <Button title="Continuar como invitado" onPress={signInAnonymously} /> */}
        <Pressable onPress={() => router.replace('/signup')}>
          <Text style={{ color: '#F5F5DC', fontFamily: 'Overlock' }}>
            ¿No tenés una cuenta? ¡Registrate!
          </Text>
        </Pressable>
        <Spacer />
        <Pressable onPress={signInAnonymously}>
          <Text style={{ color: '#F5F5DC', fontFamily: 'Overlock' }}>
            Continuar como invitado
          </Text>
        </Pressable>
        {/* <Text style={{ color: '#FFF' }}>{JSON.stringify(user)}</Text> */}
        <Spacer />
        <Spacer />
        <Pressable
          style={[
            adminStyles.activeActionButton as ViewStyle,
            { height: 50, width: 50 },
          ]}
          onPress={() => promptAsync()}
        >
          <Ionicons name="logo-google" size={30} color={'#181815'} />
        </Pressable>
      </View>
    </View>
  )
}
