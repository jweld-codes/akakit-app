import { USER_METADATA } from "@/constants/metadata/user_data";
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import {
  StyleSheet,
  View
} from 'react-native';
import { default as color } from '../../constants/colors';
import '../global.css';

export default function TabLayout() {
  const user = USER_METADATA[0];

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
            source={require("../../assets/images/icons/icon_clase_512_black.png")}
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

        <Tabs.Screen name='ajustes' options={{
            tabBarLabel: '',
            tabBarActiveTintColor: color.color_palette_2.pink_darker,
            tabBarIcon: ({ color, size }) => (
               user.avatar ? (
                <Image source={require("../../assets/images/avatars/1739031396143.png")} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
              )
            )
          }}
        />

    </Tabs>
  )
}

const styles = StyleSheet.create({
  
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    top: 2,
    right: 5,
    width: 30,
    height: 30,
    borderRadius: 35,
  },

  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 35,
    backgroundColor: '#9e9e9eff',
    justifyContent: 'center',
    alignItems: 'center',
  },

});