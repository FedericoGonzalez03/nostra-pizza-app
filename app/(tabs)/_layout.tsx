import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {

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
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'pizza' : 'pizza-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: '',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'cart' : 'cart-outline'} color={color} />
            ),
          }}
        />
      </Tabs></>
  );
}
