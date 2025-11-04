// app/_layout.jsx
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OverviewDataProvider } from '../context/OverviewDataContext';
import useNotifications from '../hooks/useNotifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { expoPushToken, notification } = useNotifications();
  const fontReference = '../assets/fonts';

  const [fontsLoaded, error] = useFonts({
    "RedRose-Regular": require('../assets/fonts/Red_Rose/static/RedRose-Regular.ttf'),
    "RedRose-Bold": require('../assets/fonts/Red_Rose/static/RedRose-Bold.ttf'),
    "RedRose-SemiBold": require('../assets/fonts/Red_Rose/static/RedRose-SemiBold.ttf'),

    "poppins-regular": require('../assets/fonts/Poppins/Poppins-Regular.ttf'),
    "poppins-bold": require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
    "poppins-semibold": require('../assets/fonts/Poppins/Poppins-SemiBold.ttf'),
    "poppins-extrabold": require('../assets/fonts/Poppins/Poppins-ExtraBold.ttf'),
  });

  // Manejar carga de fuentes
  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // Manejar token de notificaciones
  useEffect(() => {
    if (expoPushToken) {
      //console.log('Push Token registrado:', expoPushToken);
      // Aquí podrías guardar el token en tu backend/Firestore si lo necesitas
      // Por ejemplo: savePushTokenToFirestore(expoPushToken);
    }
  }, [expoPushToken]);

  // Manejar notificación recibida
  useEffect(() => {
    if (notification) {
     // console.log('Nueva notificación:', notification);
      // Aquí podrías mostrar un banner o actualizar un badge
    }
  }, [notification]);

  // No renderizar hasta que las fuentes estén cargadas
  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OverviewDataProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(tabs)' />
        </Stack>
      </OverviewDataProvider>
    </GestureHandlerRootView>
  );
}