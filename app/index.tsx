import { Image, View, Text, Platform, Button, TextStyle } from 'react-native'
import ParallaxScrollView from '@/components/ParallaxScrollView'
import { Href, useRouter } from 'expo-router'
import {
  createRStyle,
  useMQ,
  useResponsiveHeight,
  useRH,
  useRS,
  useRW,
} from 'react-native-full-responsive'
import { useEffect, useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { FONT_SIZES } from '@/components/Constants'

export default function HomeScreen() {
  const auth = useSelector((state: RootState) => state.auth)

  const router = useRouter()

  function rsx(x: number) {
    return x * rs
  }

  const rs = useRS(1)
  const lh = useRS(60)
  const hh = useResponsiveHeight(30)
  const h = useRH(1)
  const w = useRW(1)
  const mq = useMQ()

  return (
    <>
      {Platform.OS == 'web' && (
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
          headerHeight={hh}
          headerImage={
            <Image
              source={require('@/assets/images/fondo-pizza.jpg')}
              style={{
                height: hh,
                width: '100%',
                bottom: 0,
                left: 0,
                position: 'absolute',
              }}
            />
          }
        >
          <View style={styles.titleContainer}>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Text
                style={{
                  ...styles.titleText,
                  color: '#F5F5DC',
                  fontSize: rsx(FONT_SIZES.large),
                  lineHeight: lh,
                }}
              >
                Siempre es buen momento para{' '}
              </Text>
              <Text
                style={{
                  fontFamily: 'OverlockBlack',
                  fontWeight: 400,
                  fontSize: rsx(FONT_SIZES.large),
                  lineHeight: lh,
                  color: '#A11F1F',
                  borderRadius: 10,
                  backgroundColor: '#D2C682',
                  padding: rsx(10),
                }}
              >
                una buena pizza.
              </Text>
            </View>
          </View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                ...styles.titleContainer,
                marginTop: 20,
                maxWidth: 70 * w,
              }}
            ></View>
            <Text
              onPress={() => router.push('/menu')}
              style={
                {
                  color: '#D2C682',
                  borderRadius: 10,
                  background:
                    'linear-gradient(25deg, rgba(27,0,0,1) 0%, rgba(131,26,26,1) 100%)',
                  padding: rsx(30),
                  fontFamily: 'OverlockBlack',
                  fontSize: rsx(FONT_SIZES.extraLarge),
                  textAlign: 'center',
                  borderColor: '#A11F1F',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                } as unknown as TextStyle
              }
            >
              Pedí ahora ONLINE con 15% OFF
            </Text>
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#D2C682',
                  borderRadius: 10,
                  padding: rsx(15),
                  fontFamily: 'Overlock',
                  fontSize: rsx(FONT_SIZES.small),
                  textAlign: 'center',
                }}
              >
                Próximamente en App Store y Google Play.
              </Text>
              <View
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 10,
                }}
              >
                <Ionicons
                  name="logo-apple-appstore"
                  size={40}
                  color="#D2C682"
                />
                <Ionicons
                  name="logo-google-playstore"
                  size={40}
                  color="#D2C682"
                />
              </View>
            </View>
          </View>
        </ParallaxScrollView>
      )}
    </>
  )
}

const styles = createRStyle({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontFamily: 'Overlock',
    color: '#F5DCDC',
    textAlign: 'center',
    width: '100%',
  },
})
