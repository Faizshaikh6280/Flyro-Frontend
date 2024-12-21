import { Platform, View } from 'react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { homeStyles } from '@/styles/homeStyles';
import LocationBar from '../customer/LocationBar';
import { StatusBar } from 'expo-status-bar';
import { screenHeight } from '@/utils/Constants';
import DraggableMap from './DraggableMap';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import SheetContent from './SheetContent';

const androidHeights = [
  screenHeight * 0.2,
  screenHeight * 0.42,
  screenHeight * 0.8,
];
const iosHeights = [screenHeight * 0.2, screenHeight * 0.6];

const Home = () => {
  const bottomSheefRef = useRef(null);
  const snapPoints = useMemo(
    () => (Platform.OS === 'ios' ? iosHeights : androidHeights),
    []
  );

  const [mapHeight, setMapHeight] = useState(snapPoints[1]);

  const handleSheetChanges = useCallback((index: number) => {
    let height;
    if (index === 0) {
      height = screenHeight * 0.76;
    } else {
      height = screenHeight * 0.5;
    }
    setMapHeight(height);
  }, []);

  return (
    <View style={homeStyles.container}>
      <StatusBar style="light" backgroundColor="orange" translucent={false} />
      <LocationBar />
      <DraggableMap height={mapHeight} />

      <BottomSheet
        ref={bottomSheefRef}
        index={0}
        handleIndicatorStyle={{
          backgroundColor: '#ccc',
        }}
        enableOverDrag={true}
        enableDynamicSizing
        style={{ zIndex: 4 }}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <BottomSheetScrollView contentContainerStyle={homeStyles.container}>
          <SheetContent />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

export default Home;
