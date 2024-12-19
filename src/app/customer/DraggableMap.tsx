import { Image, TouchableOpacity, View } from 'react-native';
import React, { FC, useEffect, useRef } from 'react';
import MapView, { Region } from 'react-native-maps';
import { indiaIntialRegion } from '@/utils/CustomMap';
import { mapStyles } from '@/styles/mapStyles';
import { RFValue } from 'react-native-responsive-fontsize';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useUserStorage } from '@/store/userStore';
import { useIsFocused } from '@react-navigation/native';

import * as Location from 'expo-location';

interface Props {
  height: number;
}

const DraggableMap: FC<Props> = ({ height }) => {
  const mapRef = useRef<MapView>(null);

  const isFocused = useIsFocused();

  const MAX_DISTANCE_THRESHOLD = 10_000;
  const outOfRage = false;

  const { setLocation, location, outOfRange, setOutOfRange } = useUserStorage();

  const askedLocationAccess = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({});

        const { latitude, longitude } = location.coords;

        mapRef?.current?.fitToCoordinates([{ latitude, longitude }], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      } catch (error) {
        console.log('Error getting current location', error);
      }
    } else {
      console.log('Permission to access location was denied');
    }
  };

  useEffect(() => {
    if (isFocused) askedLocationAccess();
  }, [isFocused]);

  const hanleGpsButtonPress = () => {};
  const handleRegionChangeComplete = async () => {
    console.log('Region changed');
  };

  return (
    <View style={{ height: height || 300, width: '100%' }}>
      <MapView
        ref={mapRef}
        maxZoomLevel={16}
        minZoomLevel={12}
        pitchEnabled={false}
        onRegionChangeComplete={handleRegionChangeComplete}
        initialRegion={indiaIntialRegion}
        showsMyLocationButton={false}
        showsCompass={false}
        showsIndoors={false}
        showsIndoorLevelPicker={false}
        showsTraffic={false}
        showsScale={false}
        showsBuildings={false}
        showsPointsOfInterest={false}
        showsUserLocation={true}
        style={{ flex: 1 }}
      ></MapView>

      <View style={mapStyles.centerMarkerContainer}>
        <Image
          source={require('@/assets/icons/marker.png')}
          style={mapStyles.marker}
        />
      </View>

      <TouchableOpacity
        style={mapStyles.gpsButton}
        onPress={hanleGpsButtonPress}
      >
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={RFValue(16)}
          color="#3c75BE"
        />
      </TouchableOpacity>

      {outOfRage && (
        <View style={mapStyles.outOfRange}>
          <FontAwesome6 name="road-circle-exclamation" size={24} color="red" />
        </View>
      )}
    </View>
  );
};

export default DraggableMap;
