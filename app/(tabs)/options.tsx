import React from 'react'
import { Pressable, ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native'
import { styles } from '../styles'
import { useMQ, useRS } from 'react-native-full-responsive'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../slices/authReducer'
import { FONT_SIZES } from '@/components/Constants'
import { RootState } from '../store'
import { useRouter } from 'expo-router'

export default function Options() {
  const mq = useMQ()
  const rs = useRS(1)
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  return (
    <>
      <View
        style={{
          display: 'flex',
          backgroundColor: '#181815',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <Text
          style={[
            styles.screenTitle as TextStyle,
            { fontSize: ['xs', 'sm'].includes(mq) ? 50 * rs : 30 * rs },
          ]}
        >
          Opciones
        </Text>
        <ScrollView>
          {!auth.isGuest && (
            <Pressable
              style={optStyles.optionButton as ViewStyle}
              onPress={() => {
                dispatch(logout());
                AsyncStorage.removeItem('@user');
              }}
            >
              <Text style={[optStyles.option as TextStyle, { fontSize: ['xs', 'sm'].includes(mq) ? FONT_SIZES.medium * rs : FONT_SIZES.small * rs }]}>Cerrar sesión</Text>
            </Pressable>
          )}

          {auth.isGuest && (
            <Pressable
              style={optStyles.optionButton as ViewStyle}
              onPress={() => {
                router.push('/login');
              }}
            >
              <Text style={[optStyles.option as TextStyle, { fontSize: ['xs', 'sm'].includes(mq) ? FONT_SIZES.medium * rs : FONT_SIZES.small * rs }]}>Cerrar sesión</Text>
            </Pressable>
          )}

        </ScrollView>
      </View>
    </>
  )
}


const optStyles = {
  option: {
    color: '#D2C682',
    marginVertical: 10,
  },
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#AF1F1F',
    // paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  }
};