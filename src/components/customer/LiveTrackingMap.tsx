import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { memo, useEffect, useRef, useState } from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { indiaIntialRegion } from '@/utils/CustomMap';
import MapViewDirectiions from 'react-native-maps-directions';
import { getPoints, reverseGeocode } from '@/utils/mapUtils';
import { Colors } from '@/utils/Constants';
import { mapStyles } from '@/styles/mapStyles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import * as Location from 'expo-location';
import { useUserStorage } from '@/store/userStore';

const apiKey = process.env.EXPO_PUBLIC_MAP_API_KEY || '';

const LiveTrackingMap = ({ height, status, drop, pickup, captain }: any) => {
  const mapRef = useRef<MapView>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const fitToMarkers = async () => {
    if (isUserInteracting) return;
    const coordinates = [];

    if (pickup?.latitude && pickup?.longitude && status === 'START') {
      coordinates.push({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
      });
    }

    if (drop?.latitude && drop?.longitude && status === 'ARRIVED') {
      coordinates.push({ latitude: drop.latitude, longitude: drop.longitude });
    }
    if (captain?.latitude && captain?.longitude) {
      coordinates.push({
        latitude: captain.latitude,
        longitude: captain.longitude,
      });
    }

    try {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } catch (error) {}

    if (coordinates.length === 0) return;
  };

  const calculateInitialRegion = () => {
    if (pickup?.latitude && drop?.latitude) {
      const latitude = (pickup?.latitude + drop?.latitude) / 2;
      const longitude = (pickup?.longitude + drop?.longitude) / 2;

      return {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    return indiaIntialRegion;
  };

  const hanleGpsButtonPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const { setLocation } = useUserStorage();

    if (status === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({});

        const { latitude, longitude } = location.coords;

        mapRef?.current?.fitToCoordinates([{ latitude, longitude }], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        const address = await reverseGeocode(
          newRegion?.latitude,
          newRegion.longitude
        );

        setLocation({
          longitude: newRegion?.latitude,
          latitude: newRegion?.latitude,
          address: address,
        });
      } catch (error) {
        console.log('Error getting current location', error);
      }
    } else {
      console.log('Permission to access location was denied');
    }
  };

  useEffect(() => {
    if (pickup?.latitude && drop?.latitude) {
      fitToMarkers();
    }
  }, [drop?.latitude, pickup?.latitude, captain?.latitude]);

  return (
    <View style={{ height }}>
      <MapView
        ref={mapRef}
        maxZoomLevel={18}
        minZoomLevel={12}
        pitchEnabled={false}
        onRegionChange={() => setIsUserInteracting(true)}
        onRegionChangeComplete={() => setIsUserInteracting(false)}
        initialRegion={calculateInitialRegion()}
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
      >
        {captain?.latitude && pickup?.latitude && (
          <MapViewDirectiions
            origin={captain}
            destination={status === 'START' ? pickup : drop}
            apikey={apiKey}
            strokeWidth={5}
            precision="high"
            onReady={fitToMarkers}
            strokeColor="red"
            onError={(err) => {
              console.log('Direction Error ', err);
            }}
          />
        )}

        {pickup?.latitude && (
          <Marker
            coordinate={{
              latitude: pickup.latitude,
              longitude: pickup.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={2}
          >
            <Image
              source={require('@/assets/icons/marker.png')}
              style={{ height: 30, width: 30, resizeMode: 'contain' }}
            />
          </Marker>
        )}

        {drop?.latitude && (
          <Marker
            coordinate={{ latitude: drop.latitude, longitude: drop.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={1}
          >
            <Image
              source={require('@/assets/icons/drop_marker.png')}
              style={{ height: 30, width: 30, resizeMode: 'contain' }}
            />
          </Marker>
        )}

        {captain?.latitude && (
          <Marker
            coordinate={{
              latitude: captain.latitude,
              longitude: captain.longitude,
            }}
            anchor={{ x: 0.5, y: 1 }}
            zIndex={3}
          >
            <View style={{ transform: [{ rotate: `${captain?.heading}deg` }] }}>
              <Image
                source={require('@/assets/icons/cab_marker.png')}
                style={{ height: 40, width: 40, resizeMode: 'contain' }}
              />
            </View>
          </Marker>
        )}

        {drop && pickup && (
          <Polyline
            coordinates={getPoints([drop, pickup])}
            strokeColor={Colors.text}
            strokeWidth={2}
            geodesic={true}
            lineDashPattern={[12, 10]}
          />
        )}

        {/* <TouchableOpacity
          style={mapStyles.gpsButton}
          onPress={hanleGpsButtonPress}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={RFValue(16)}
            color="#3c75BE"
          />
        </TouchableOpacity> */}
      </MapView>
    </View>
  );
};

export default memo(LiveTrackingMap);
