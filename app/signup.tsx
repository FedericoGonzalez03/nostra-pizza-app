import React, { useState, useContext, useEffect } from 'react'
import { View, Text, TextInput, Pressable, ViewStyle, TextStyle, Platform } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { login } from './slices/authReducer'
import { useRouter } from 'expo-router'
import adminStyles from '@/components/admin/adminStyles'
import Spacer from '@/components/Spacer'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { FONT_SIZES } from '@/components/Constants'
import { useRS } from 'react-native-full-responsive'
import { Ionicons } from '@expo/vector-icons'
import { ErrorContext } from './_layout'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from './types/authTypes'
import { RootState } from './store'

WebBrowser.maybeCompleteAuthSession();

declare type TGoogleUser = {
  id: string
  name: string
  email: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export default function SignupScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [rePasswordError, setRePasswordError] = useState<string | null>(null);
  const dispatch = useDispatch()
  const router = useRouter()
  
  const { showErrorModal } = useContext(ErrorContext)

  const auth = useSelector((state: RootState) => state.auth);

  const rs = useRS(1)

  useEffect(() => {
    if (auth.isGuest || auth.isAuthenticated) {
      router.replace('/(tabs)/menu')
    }
  }, [auth])

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

  const validateEmail = (email: string) => {
    if (!emailRegex.test(email)) {
      setEmailError('Correo electrónico no válido');
    } else {
      setEmailError(null);
    }
  };

  const validatePassword = (password: string) => {
    setRePasswordError(null);
    if (!passwordRegex.test(password)) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres, una letra y un número');
    } else {
      setPasswordError(null);
    }
  };

  const validateRePassword = (rePassword: string) => {
    if (rePassword !== password) {
      setRePasswordError('Las contraseñas no coinciden');
    } else {
      setRePasswordError(null);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !phone || !password || !rePassword) {
      showErrorModal('Todos los campos son obligatorios');
      return;
    }
  
    validateEmail(email);
    validatePassword(password);
    validateRePassword(rePassword);

    if (!emailRegex.test(email) || !passwordRegex.test(password) || rePassword !== password) {
      showErrorModal('Por favor, corrija los errores antes de continuar');
      return;
    }
  
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password }),
      });
      if (response.status === 409) {
        showErrorModal('Ya existe una cuenta con ese correo electrónico');
        return;
      }
      if (response.status !== 201) {
        showErrorModal('Error al crear la cuenta');
        return;
      }
      const data = await response.json();
      const user = await getUser(data);
      dispatch(login(user));
    } catch (error) {
      showErrorModal(error!.toString());
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(null);
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(null);
    setRePasswordError(null);
  };

  const handleRePasswordChange = (text: string) => {
    setRePassword(text);
    setRePasswordError(null);
  };

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
          placeholder="Nombre"
          style={[adminStyles.input as TextStyle, {fontSize: Math.max(FONT_SIZES.small * rs, 16), height: FONT_SIZES.large * rs, minHeight: 30}]}
          value={name}
          onChangeText={handleNameChange}
          placeholderTextColor={'#F5F5DC'}
        />
        <Spacer />
        <TextInput
          placeholder="Email"
          style={[
            adminStyles.input as TextStyle,
            {
              fontSize: Math.max(FONT_SIZES.small * rs, 16), 
              height: FONT_SIZES.large * rs, 
              minHeight: 30
            },
            email && emailError && { borderColor: '#A11F1F', borderWidth: 2, backgroundColor: '#A444', },
          ]}
          value={email}
          keyboardType='email-address'
          onChangeText={handleEmailChange}
          onBlur={() => validateEmail(email)}
          placeholderTextColor={'#F5F5DC'}
        />
        {email && emailError && <Text style={{ color: '#A11F1F' }}>{emailError}</Text>}
        <Spacer />
        <TextInput
          placeholder="Teléfono"
          style={[adminStyles.input as TextStyle, {fontSize: Math.max(FONT_SIZES.small * rs, 16), height: FONT_SIZES.large * rs, minHeight: 30}]}
          value={phone}
          keyboardType='phone-pad'
          onChangeText={handlePhoneChange}
          placeholderTextColor={'#F5F5DC'}
        />
        <Spacer />
        <TextInput
          placeholder="Contraseña"
          style={[adminStyles.input as TextStyle, {fontSize: Math.max(FONT_SIZES.small * rs, 16), height: FONT_SIZES.large * rs, minHeight: 30}]}
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          onBlur={() => validatePassword(password)}
          placeholderTextColor={'#F5F5DC'}
        />
        {password && passwordError && <Text style={{ color: '#A11F1F' }}>{passwordError}</Text>}
        <Spacer />
        <TextInput
          placeholder="Repita la contraseña"
          style={[adminStyles.input as TextStyle, {fontSize: Math.max(FONT_SIZES.small * rs, 16), height: FONT_SIZES.large * rs, minHeight: 30}]}
          value={rePassword}
          onChangeText={handleRePasswordChange}
          secureTextEntry
          onBlur={() => validateRePassword(rePassword)}
          placeholderTextColor={'#F5F5DC'}
        />
        {rePassword && rePasswordError && <Text style={{ color: '#A11F1F' }}>{rePasswordError}</Text>}
        <Spacer />
        <Pressable
          style={adminStyles.activeActionButton as ViewStyle}
          onPress={handleSignup}
        >
          <Text style={adminStyles.activeActionButtonText as TextStyle}>
            Signup
          </Text>
        </Pressable>
        <Spacer />
        <Pressable onPress={() => router.replace('/login')}>
          <Text style={{ color: '#F5F5DC', fontFamily: 'Overlock' }}>
            ¿Ya tenés una cuenta? ¡Ingresá!
          </Text>
        </Pressable>
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
