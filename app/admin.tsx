import React, { useState } from 'react'
import { ScrollView, Text, TextStyle, View, ViewStyle } from 'react-native'
import { styles } from './styles'
import { useMQ, useRS } from 'react-native-full-responsive'
import ProductsAdministration from '@/components/admin/ProductsAdministration'
import FlavoursAdministration from '@/components/admin/FlavoursAdministration'
import FlavourGroupsAdministration from '@/components/admin/FlavourGroupsAdministration'

export default function AdminPage() {
  const [active, setActive] = useState<string>('products')

  const rs = useRS(1)
  const mq = useMQ()

  return (
    <View style={[styles.main as ViewStyle, { padding: 0 }]}>
      <Text
        style={[
          styles.screenTitle as TextStyle,
          { fontSize: ['xs', 'sm'].includes(mq) ? 50 * rs : 30 * rs },
        ]}
      >
        Administración
      </Text>
      <View style={{ height: 45, maxWidth: '95%' }}>
        <ScrollView
          contentContainerStyle={adminStyles.sections as ViewStyle}
          horizontal={true}
        >
          <View style={adminStyles.section}>
            <Text
              style={[
                adminStyles.sectionTitle,
                active == 'orders' ? adminStyles.active : null,
              ]}
              onPress={() => setActive('orders')}
            >
              Pedidos
            </Text>
          </View>
          <View style={adminStyles.section}>
            <Text
              style={[
                adminStyles.sectionTitle,
                active == 'products' ? adminStyles.active : null,
              ]}
              onPress={() => setActive('products')}
            >
              Productos
            </Text>
          </View>
          <View style={adminStyles.section}>
            <Text
              style={[
                adminStyles.sectionTitle,
                active == 'flavours' ? adminStyles.active : null,
              ]}
              onPress={() => setActive('flavours')}
            >
              Gustos / Opciones
            </Text>
          </View>
          <View style={adminStyles.lastSection}>
            <Text
              style={[
                adminStyles.sectionTitle,
                active == 'flavourGroups' ? adminStyles.active : null,
              ]}
              onPress={() => setActive('flavourGroups')}
            >
              Grupos de Gustos / Opciones
            </Text>
          </View>
        </ScrollView>
      </View>
      {active == 'products' && <ProductsAdministration />}
      {active == 'flavours' && <FlavoursAdministration />}
      {active == 'flavourGroups' && <FlavourGroupsAdministration />}
    </View>
  )
}

const adminStyles = {
  section: {
    borderRightWidth: 2,
    borderRightColor: '#D2C682',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  lastSection: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#F5F5DC',
    fontFamily: 'Overlock',
  },
  sections: {
    borderBottomWidth: 2,
    borderBottomColor: '#D2C682',
    display: 'flex',
    flexDirection: 'row',
    height: 40,
  },
  active: {
    color: '#D2C682',
  },
}
