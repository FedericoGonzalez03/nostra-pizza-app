import { Tabs, useRouter } from 'expo-router'
import React, { useEffect } from 'react'

import { TabBarIcon } from '@/components/navigation/TabBarIcon'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

export default function TabLayout() {

  const auth = useSelector((state: RootState) => state.auth);

  const router = useRouter()

  useEffect(() => {
    if (!auth.isGuest && !auth.isAuthenticated) {
      router.push('/login')
    }
  }, [auth])

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#CE2727',
          tabBarInactiveTintColor: '#D2C682',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1f1f1f',
          },
        }}
      >
        <Tabs.Screen
          name="menu"
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? 'pizza' : 'pizza-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? 'cart' : 'cart-outline'}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="options"
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? 'options' : 'options-outline'}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  )
}
