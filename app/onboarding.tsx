import { DecorativeCircle } from '@/components/DecorativeCircle';
import colors from '@/constants/colors';
import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CSSAnimationKeyframes } from 'react-native-reanimated';
import "./global.css";

const pulse: CSSAnimationKeyframes = {
  from: {
    transform: [{ scale: 0.8 }, { rotateZ: '-15deg' }],
  },
  to: {
    transform: [{ scale: 1.2 }, { rotateZ: '15deg' }],
  },
};

export default function onboarding() {
  
  return(
    <View
    style={{
      flex:1, 
      justifyContent:'center', 
      alignItems:"center", 
      backgroundColor:colors.color_palette_2.pink_darker
    }}>
          <Image 
            source={require('@/assets/images/logo/logoLighter.png')}
            style={{width: 107,height: 135,margin: 20, }} 
          />
          <Text style={styles.text_logo}>AkaKit</Text>

          <Link href="/(tabs)/dashboard" asChild>
            <TouchableOpacity style={styles.button_main}>
              <Text style={styles.button_text}>Get Started</Text>
            </TouchableOpacity>
          </Link>

          <DecorativeCircle 
            bottom={-260} 
            left={-210} 
            width={450} 
            height={450} 
            color={colors.color_palette_2.pink_soft} 
            opacity={1}
          />

          <DecorativeCircle 
            position= 'custom'
            top={-150}
            left={180}
            width={340}
            height={340}
            opacity={1}
            color={colors.color_palette_2.pink_soft}
          />

          <DecorativeCircle 
            position= 'custom'
            top={60}
            left={90}
            width={90}
            height={90}
            opacity={1}
            color={colors.color_palette_2.pink_soft}
          />

          <DecorativeCircle 
            position= 'custom'
            top={145}
            left={160}
            width={60}
            height={60}
            opacity={1}
            borderWidth={6}
            borderColor={colors.color_palette_2.pink_soft}
            color={colors.color_palette_2.pink_darker}
          />

          <DecorativeCircle 
            bottom={85} 
            left={210} 
            width={100} 
            height={100} 
            color={colors.color_palette_2.pink_soft} 
            opacity={1}
          />

          <DecorativeCircle 
            bottom={160} 
            left={150} 
            width={60} 
            height={60} 
            opacity={1}
            borderWidth={6}
            borderColor={colors.color_palette_2.pink_soft}
            color={colors.color_palette_2.pink_darker}
          />

    </View>

    
  );
}

const styles = StyleSheet.create({
  text_logo: {
    color: colors.color_palette_2.pink_soft,
            fontWeight: 'bold',
            fontSize: 48,
            textAlign:"center", 
            fontFamily:'RedRose-Bold'
  },

  circulebounce:{
    animationName: pulse,
            animationDuration: '1s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
            animationDirection: 'alternate',
  },

  button_main: {
    margin: 30,
    width: '60%',
    backgroundColor: colors.color_palette_2.pink_soft,
    padding: 20,
    borderRadius: 10
  },
  button_text: {
    textAlign:'center',
    fontWeight: 'bold',
    color: colors.color_palette_1.lineArt_Purple
  }

})