import React from 'react';
import { StatusBar, View } from 'react-native';
import Overview from '../../components/Home/Overview';
import Header from '../../components/Templates/Header';
import UtilsTabTopBlack from '../../components/Templates/UtilsTabTopBlack';
import '../global.css';

export default function Dashboard() {
  return (
    <View style={{flex: 1}} >
      <StatusBar barStyle="light-content"></StatusBar>
      <UtilsTabTopBlack />
        <Header />
        <Overview />

    </View>
  )
}