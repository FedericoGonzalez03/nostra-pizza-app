import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'

export const DisabledRadioWithLabel = ({
  label,
  size,
}: {
  label: string | (() => string)
  size: number
}) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: size,
      }}
    >
      <Ionicons name="close-circle-outline" size={size * 2} color={'#AAB3'} />

      <Text style={{ color: '#EED3', fontFamily: 'Overlock', fontSize: size }}>
        {typeof label === 'function' ? label() : label}
      </Text>
    </View>
  )
}
