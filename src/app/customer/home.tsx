import { Platform, View } from 'react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { homeStyles } from '@/styles/homeStyles';
import LocationBar from '../customer/LocationBar';
import { StatusBar } from 'expo-status-bar';
import { screenHeight } from '@/utils/Constants';
import DraggableMap from './DraggableMap';

const androidHeights = [screenHeight * 0.4, screenHeight * 0.42];

const iosHeights = [screenHeight * 0.2, screenHeight * 0.5];

const Home = () => {
  const bottomSheefRef = useRef(null);
  const snapPoints = useMemo(
    () => (Platform.OS === 'ios' ? iosHeights : androidHeights),
    []
  );

  const [mapHeight, setMapHeight] = useState(snapPoints[0]);

  const handleSheetChanges = useCallback((index: number) => {
    let height = screenHeight * snapPoints[index];
    setMapHeight(height);
  }, []);

  return (
    <View style={homeStyles.container}>
      <StatusBar style="light" backgroundColor="orange" translucent={false} />
      <LocationBar />
      <DraggableMap height={mapHeight} />
    </View>
  );
};

export default Home;
