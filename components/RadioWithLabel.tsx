import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'

export const RadioWithLabel = ({
  label,
  checked,
  size,
  disabled,
}: {
  label: string | (() => string)
  checked: boolean
  size: number
  disabled: boolean
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
      {checked ? (
        <Ionicons
          name="radio-button-on-outline"
          size={size * 2}
          color={disabled ? '#AAB3' : checked ? '#D2C682' : '#EED3'}
        />
      ) : (
        <Ionicons
          name="radio-button-off-outline"
          size={size * 2}
          color={disabled ? '#AAB3' : checked ? '#D2C682' : '#EED3'}
        />
      )}

      <Text
        style={[
          { color: '#F5F5DC', fontFamily: 'Overlock', fontSize: size },
          disabled && { color: '#EED3' },
        ]}
      >
        {typeof label === 'function' ? label() : label}
      </Text>
    </View>
  )
}
