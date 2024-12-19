import { View } from 'react-native';
import React from 'react';
import { homeStyles } from '@/styles/homeStyles';
import LocationBar from '../customer/LocationBar';
import { StatusBar } from 'expo-status-bar';

const home = () => {
  return (
    <View style={homeStyles.container}>
      <StatusBar
        style="light"
        backgroundColor="orange"
        translucent={false}
      ></StatusBar>
    </View>
  );
};

export default home;
