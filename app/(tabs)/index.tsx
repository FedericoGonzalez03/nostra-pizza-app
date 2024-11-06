import { Image, View, Text } from 'react-native';;
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Href, useRouter } from 'expo-router';
import { createRStyle, useMQ, useResponsiveHeight, useRH, useRS, useRW } from 'react-native-full-responsive';

export default function HomeScreen() {


  function rsx(x: number) {
    return x * rs;
  };

  const router = useRouter();
  const rs = useRS(1);
  const lh = useRS(60);
  const hh = useResponsiveHeight(30);
  const h = useRH(1);
  const w = useRW(1);
  const mq = useMQ();

  return (
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
      }>
      <View style={styles.titleContainer}>
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: "100%" }}>
          <Text style={{ ...styles.titleText, color: '#F5F5DC', fontSize: rsx(30), lineHeight: lh }}>Siempre es buen momento para </Text>
          <Text style={{ fontFamily: 'Coustard', fontWeight: 400, fontSize: rsx(30), lineHeight: lh, color: '#9B1C1C', borderRadius: 10, backgroundColor: '#D2C682', padding: rsx(10) }}>una buena pizza.</Text>
        </View>
      </View>
      <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ ...styles.titleContainer, marginTop: 40, maxWidth: 70 * w }}>
          <Text onPress={() => router.navigate('menu' as Href)}
            style={{ color: '#D2C682', borderRadius: 10, backgroundColor: '#A11F1F', padding: rsx(30), fontFamily: 'Coustard', fontSize: rsx(45), textAlign: 'center' }}>
            Pedí ahora ONLINE con 15% OFF
          </Text>
        </View>
        <Text
          onPress={() => router.navigate('admin' as Href)}
          >Administración</Text>
      </View>
    </ParallaxScrollView>
  );
}

const styles = createRStyle({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontFamily: 'Coustard',
    color: '#F5DCDC',
    textAlign: 'center',
    width: '100%',
  }
});
