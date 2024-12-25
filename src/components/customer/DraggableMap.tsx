import { Image, TouchableOpacity, View } from 'react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { indiaIntialRegion } from '@/utils/CustomMap';
import { mapStyles } from '@/styles/mapStyles';
import { RFValue } from 'react-native-responsive-fontsize';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUserStorage } from '@/store/userStore';
import { useIsFocused } from '@react-navigation/native';

import * as Location from 'expo-location';
import { reverseGeocode } from '@/utils/mapUtils';
import haversine from 'haversine-distance';
import { useWS } from '@/service/WSProvider';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { memo } from 'react';

interface Props {
  height: number;
}

const DraggableMap: FC<Props> = ({ height }) => {
  const MAX_DISTANCE_THRESHOLD = 10_000;

  const mapRef = useRef<MapView>(null);
  const isFocused = useIsFocused();
  const { emit, on, off } = useWS();
  const { setLocation, location, setOutOfRange, outOfRange } = useUserStorage();

  const [markers, setMarkers] = useState<any>([]);

  useEffect(() => {
    if (isFocused) askedLocationAccess();
  }, [isFocused]);

  // for real captains
  useEffect(() => {
    if (location?.latitude && location?.longitude && isFocused) {
      emit('subscribeToZone', {
        latitude: location.latitude,
        longitude: location.longitude,
      });

      on('nearbyCaptains', (captains: any[]) => {
        const updatedMarkers = captains?.map((captain) => {
          return {
            id: captain?.id,
            latitude: captain?.coords?.latitude,
            longitude: captain?.coords?.longitude,
            type: 'captain',
            rotation: captain.coords.heading,
            visible: true,
          };
        });
        setMarkers(updatedMarkers as any);
      });
    }

    return () => {
      off('nearbyCaptains');
    };
  }, []);

  // simulation fo captain markers
  useEffect(() => {
    generateRandomMarkers();
  }, [location]);

  const generateRandomMarkers = () => {
    if (!location?.latitude || !location.longitude) return;

    const type = ['bike', 'auto', 'cab'];

    const newMarkers = Array.from({ length: 20 }, (_, index) => {
      const randomType = type[Math.floor(Math.random() * type.length)];
      const randomRotation = Math.floor(Math.random() * 360);
      //30.6972901 76.8271786 // current location

      return {
        id: index,
        latitude: location?.latitude + (Math.random() - 0.5) * 0.01,
        longitude: location?.longitude + (Math.random() - 0.5) * 0.01,
        type: randomType,
        rotation: randomRotation,
        visible: true,
      };
    });
    setMarkers(newMarkers);
  };

  const hanleGpsButtonPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

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

  const handleRegionChangeComplete = async (newRegion: Region) => {
    const address = await reverseGeocode(
      newRegion?.latitude,
      newRegion?.longitude
    );

    if (location?.latitude && location?.longitude) {
      const userLocation = {
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const newLocation = {
        latitude: newRegion?.latitude,
        longitude: newRegion?.longitude,
      };

      const distance = haversine(userLocation, newLocation);

      if (distance > MAX_DISTANCE_THRESHOLD) {
        setOutOfRange(true);
      }
    }

    setLocation({
      latitude: newRegion?.latitude,
      longitude: newRegion?.longitude,
      address: address,
    });
  };

  const askedLocationAccess = async () => {
    if (!location) {
      const { status } = await Location.requestForegroundPermissionsAsync();

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
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };

          // After fitting, zoom in further
          setTimeout(() => {
            mapRef?.current?.animateToRegion(newRegion, 500);
          }, 1000);

          handleRegionChangeComplete(newRegion);
        } catch (error) {
          console.log('Error getting current location', error);
        }
      } else {
        console.log('Permission to access location was denied');
      }
    } else {
      const { latitude, longitude } = location;

      mapRef?.current?.fitToCoordinates([{ latitude, longitude }], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  return (
    <View style={{ height: height, width: '100%' }}>
      <MapView
        ref={mapRef}
        maxZoomLevel={18}
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
      >
        {markers
          ?.filter(
            (marker: any) =>
              marker.latitude && marker.longitude && marker.visible
          )
          ?.map((marker: any, index: number) => {
            return (
              <Marker
                zIndex={index + 1}
                key={index}
                flat
                anchor={{ x: 0.5, y: 0.5 }}
                coordinate={{
                  latitude: marker?.latitude,
                  longitude: marker?.longitude,
                }}
              >
                <View
                  style={{
                    transform: [{ rotate: `${marker?.rotation}deg` }],
                  }}
                >
                  {marker.type === 'bike' && (
                    <Image
                      source={require('@/assets/icons/bike_marker.png')}
                      style={{ width: 40, height: 40, resizeMode: 'contain' }}
                    />
                  )}

                  {marker.type === 'auto' && (
                    <Image
                      source={require('@/assets/icons/auto_marker.png')}
                      style={{ width: 40, height: 40, resizeMode: 'contain' }}
                    />
                  )}

                  {marker.type === 'cab' && (
                    <Image
                      source={require('@/assets/icons/cab_marker.png')}
                      style={{ width: 40, height: 40, resizeMode: 'contain' }}
                    />
                  )}
                </View>
              </Marker>
            );
          })}
      </MapView>

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

      {outOfRange && (
        <View style={mapStyles.outOfRange}>
          <FontAwesome6 name="road-circle-exclamation" size={24} color="red" />
        </View>
      )}
    </View>
  );
};

export default memo(DraggableMap);
