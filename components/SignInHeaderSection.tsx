import { RootState } from '@/app/store'
import { styles } from '@/app/styles'
import { Ionicons } from '@expo/vector-icons'
import { Href, useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { Dimensions, Platform, Pressable, Text, TextStyle } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { FONT_SIZES } from './Constants'
import { useMQ, useRS } from 'react-native-full-responsive'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { login } from '@/app/slices/authReducer'

const SignInHeaderSection = () => {
  const router = useRouter();

  const auth = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch();

  const rs = useRS(1);
  const mq = useMQ();

  useEffect(() => {
    const checkForUser = async () => {
      const user = await AsyncStorage.getItem('@user')
      if (user) {
        dispatch(login(JSON.parse(user)))
      }
    }
    checkForUser()
  }, []);

  useEffect(() => {
    // if (auth.isAuthenticated) {
    //     router.navigate('/admin');
    // }
  }, [auth])

  return !auth.isAuthenticated ? (
    Platform.OS == 'web' && Dimensions.get('window').width > 1200 ? (
      <>
        <Pressable
          style={{
            backgroundColor: '#F5F5DC',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 50,
          }}
        >
          <Text
            onPress={() => router.push('/login')}
            style={{ color: '#1f1f1f', fontFamily: 'OverlockBlack', fontSize: FONT_SIZES.small * rs }}
          >
            Iniciar sesión
          </Text>
        </Pressable>
        <Pressable>
          <Text
            onPress={() => router.push('/signup')}
            style={{ color: '#F5F5DC', fontFamily: 'Overlock', fontSize: FONT_SIZES.small * rs  }}
          >
            Registrarse
          </Text>
        </Pressable>
      </>
    ) : (
      <Pressable onPress={() => router.push('/login')}>
        <Ionicons name="person-circle" size={ 36 } color="#D2C682" />
      </Pressable>
    )
  ) : (
    <Pressable
      onPress={() => router.push('/options')}
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {!auth.isGuest && !auth.user?.phone &&
        <Ionicons
          name="alert-circle-outline"
          size={26}
          color="#A11F1F"
        />
      }
      {!['xs', 'sm'].includes(mq) && 
        <Text style={{ color: '#D2C682', fontFamily: 'Overlock', fontSize: 16 } as unknown as TextStyle}>
          {auth.user?.name}
        </Text>
      }
      <Ionicons name="person-circle" size={36} color="#D2C682" />
    </Pressable>
  )
}

export default SignInHeaderSection
