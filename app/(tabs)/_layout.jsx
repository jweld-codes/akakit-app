import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import color from '../../constants/colors';
import '../global.css';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{headerShown: false}}>
        <Tabs.Screen name='dashboard' options={{
          tabBarLabel: 'Inicio',
          tabBarActiveTintColor: color.color_palette_2.pink_darker,
          tabBarIcon: ({ color, size }) => (
          <Image
            source={require('../../assets/images/icons/icon_16_dashboard_lapurple.png')}
            style={{ width: size, height: size, tintColor: color, padding: 6 }}
          />
          )
          
        }} />
        <Tabs.Screen name='clase'
        options={{
          tabBarLabel: 'Clases',
          tabBarActiveTintColor: color.color_palette_2.pink_darker,
          tabBarIcon: ({ color }) => (
          <Image
            source={require('../../assets/images/icons/icon_clase_512_black.png')}
            style={{ width: 36, height: 36, bottom:5, tintColor: color }}
          />
          )
        }}  />
        <Tabs.Screen name='curso' options={{
            tabBarLabel: 'Curso',
            tabBarActiveTintColor: color.color_palette_2.pink_darker,
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('../../assets/images/icons/icon_512_curso_black.png')}
                style={{ width: 34, height: 34, tintColor: color, padding: 6 }}
              />
            )
          }}
        />

        <Tabs.Screen name='tareas' options={{
            tabBarLabel: 'Tareas',
            tabBarActiveTintColor: color.color_palette_2.pink_darker,
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('../../assets/images/icons/icon_512_tareas_black.png')}
                style={{ width: size, height: size, tintColor: color}}
              />
            )
          }}
        />

        <Tabs.Screen name='calendario' options={{
            tabBarLabel: 'Calendario',
            tabBarActiveTintColor: color.color_palette_2.pink_darker,
            tabBarIcon: ({ color, size }) => (
              <Image
                source={require('../../assets/images/icons/icon_16_calendar_black.png.png')}
                style={{ width: size, height: size, tintColor: color, padding: 8 }}
              />
            )
          }}
        />


    </Tabs>
  )
}