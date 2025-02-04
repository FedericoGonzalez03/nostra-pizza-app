import { useContext, useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { ErrorContext } from '@/app/_layout'
import { CheckWithLabel } from './CheckWithLabel'
import { useMQ, useRS } from 'react-native-full-responsive'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/app/store'
import { updateItemFlavours } from '@/app/slices/cartReducer'
import { DisabledCheckWithLabel } from './DisabledCheckWithLabel'
import { RadioWithLabel } from './RadioWithLabel'
import { DisabledRadioWithLabel } from './DisabledRadioWithLabel'

export declare type TFlavour = {
  id: number
  name: string
  available: boolean
  checked?: boolean
}

export declare type TFlavourGroup = {
  name: string
  flavours: TFlavour[]
  quantity: number
}

export declare type TFlavoursResponse = {
  quantity: number
  grp_title: string
  flv_id: number
  name: string
  available: boolean
}

export default function ProductFlavours({
  prodId,
  visible,
  setDetails,
  itemKey,
}: {
  prodId: number
  visible: boolean
  setDetails: (id: string, details: string) => void
  itemKey: string
}) {
  const cartItem = useSelector((state: RootState) => state.cart).items.find(
    item => item.id === prodId,
  )

  const [flavours, setFlavours] = useState<TFlavourGroup[]>([])

  const { showErrorModal } = useContext(ErrorContext)

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (!prodId) return
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/menu/flavours/${prodId}`)
      .then(res => (res.status == 200 ? res.json() : res.text()))
      .then((data: string | TFlavoursResponse[]) => {
        if (typeof data === 'string') {
          showErrorModal(data)
        } else {
          const flavours: TFlavourGroup[] = [];
          const checkedFlavours: string[] = [];
          data.forEach(flavour => {
            const group = flavours.find(g => g.name === flavour.grp_title);
            const index = Number.parseInt(itemKey.split('_')[1]);
            const checked = cartItem?.flavours?.[index]?.includes(flavour.flv_id);
            if (checked) {
              checkedFlavours.push(flavour.name);
            }
            if (group) {
              group.flavours.push({
                checked,
                id: flavour.flv_id,
                name: flavour.name,
                available: flavour.available,
              })
            } else {
              flavours.push({
                name: flavour.grp_title,
                quantity: flavour.quantity,
                flavours: [
                  {
                    checked,
                    id: flavour.flv_id,
                    name: flavour.name,
                    available: flavour.available,
                  },
                ],
              })
            }
          })
          setFlavours(flavours);
          setDetails(itemKey, checkedFlavours.join(', '));
        }
      })
  }, [prodId])

  const handleFlavourChange = (flavourId: number) => {
    const uniqueFlavourGroup: boolean =
      flavours.find(group =>
        group.flavours.find(flavour => flavour.id === flavourId),
      )?.quantity === 1

    let wasAdded: boolean = false

    let shouldContinue: boolean = false

    const newState = flavours.map(group => {
      const totalChecked = group.flavours.filter(
        flavour => flavour.checked,
      ).length
      return {
        ...group,
        flavours: group.flavours.map(flavour => {
          if (flavour.id === flavourId) {
            if (
              flavour.checked ||
              totalChecked < group.quantity ||
              uniqueFlavourGroup
            ) {
              shouldContinue = true
              wasAdded = !flavour.checked
              return { ...flavour, checked: !flavour.checked }
            }
          } else if (uniqueFlavourGroup) {
            return { ...flavour, checked: false }
          }
          return flavour
        }),
      }
    })

    if (!shouldContinue) return

    setFlavours(newState)

    const checkedFlavours: string[] = [];
    newState.forEach(group => {
      checkedFlavours.push(
        ...group.flavours
          .filter(flavour => flavour.checked)
          .map(flavour => flavour.name),
      )
    })
    setDetails(itemKey, checkedFlavours.join(', '))

    const index: number = Number.parseInt(itemKey.split('_')[1])

    const payload = {
      id: prodId,
      flavours: [] as number[],
      index,
    }

    if (!cartItem) return
    if (!uniqueFlavourGroup && cartItem.flavours && cartItem.flavours[index]) {
      payload.flavours.push(...cartItem.flavours[index])
    }

    if (uniqueFlavourGroup) {
      payload.flavours = []
    }

    if (wasAdded) {
      payload.flavours.push(flavourId)
    }

    dispatch(updateItemFlavours(payload))
  }

  const mq = useMQ()
  const rs = useRS(1)

  return (
    <View
      style={
        visible && flavours.length > 0
          ? { display: 'flex', paddingTop: 5, width: '50%' }
          : { display: 'none', paddingTop: 0 }
      }
    >
      {flavours.map((group, i) => {
        const totalChecked = group.flavours.filter(
          flavour => flavour.checked,
        ).length
        return (
          <View key={group.name + '-' + i}>
            <Text
              style={{
                color: '#F5F5DC',
                fontFamily: 'Overlock',
                fontSize: ['xs', 'sm'].includes(mq) ? 28 * rs : 18 * rs,
              }}
            >
              {group.name} ({group.quantity === 1 ? group.quantity : 'máx'}) :
            </Text>
            {group.flavours.map(flavour => (
              <View
                key={group.name + '-' + flavour.id + '-' + i}
                style={{ paddingTop: 5 }}
              >
                <Pressable
                  onPress={() => handleFlavourChange(flavour.id)}
                  disabled={
                    !flavour.available ||
                    (!flavour.checked &&
                      group.quantity !== 1 &&
                      totalChecked >= group.quantity)
                  }
                >
                  {group.quantity !== 1 &&
                    (flavour.available ? (
                      <CheckWithLabel
                        label={flavour.name}
                        checked={flavour.checked ?? false}
                        size={['xs', 'sm'].includes(mq) ? 24 * rs : 15 * rs}
                        disabled={
                          !flavour.available ||
                          (!flavour.checked && totalChecked >= group.quantity)
                        }
                      />
                    ) : (
                      <DisabledCheckWithLabel
                        label={flavour.name}
                        size={['xs', 'sm'].includes(mq) ? 24 * rs : 15 * rs}
                      />
                    ))}
                  {group.quantity === 1 &&
                    (flavour.available ? (
                      <RadioWithLabel
                        label={flavour.name}
                        checked={flavour.checked ?? false}
                        size={['xs', 'sm'].includes(mq) ? 24 * rs : 15 * rs}
                        disabled={
                          !flavour.available ||
                          (!flavour.checked && totalChecked >= group.quantity)
                        }
                      />
                    ) : (
                      <DisabledRadioWithLabel
                        label={flavour.name}
                        size={['xs', 'sm'].includes(mq) ? 24 * rs : 15 * rs}
                      />
                    ))}
                </Pressable>
              </View>
            ))}
          </View>
        )
      })}
    </View>
  )
}
