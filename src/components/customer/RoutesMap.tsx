import { View, Text, TouchableOpacity, Image } from 'react-native';
import React, { memo, useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { mapStyles } from '@/styles/mapStyles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import { customMapStyle, indiaIntialRegion } from '@/utils/CustomMap';
import MapViewDirectiions from 'react-native-maps-directions';
import { fetchRoute } from '@/utils/mapUtils';
import { Polyline } from 'react-native-maps';

const apiKey = process.env.EXPO_PUBLIC_MAP_API_KEY || '';

const RoutesMap = ({ drop, pickup }: any) => {
  const mapRef = useRef<MapView>(null);
  const [routeCoordinates, setRouteCoordinates] = React.useState([]);

  async function fitToMarkers() {
    const coordinates = [];

    if (pickup?.latitude && pickup?.longitude) {
      coordinates.push({
        latitude: pickup?.latitude,
        longitude: pickup?.longitude,
      });
    }

    if (drop?.latitude && drop?.longitude) {
      coordinates.push({
        latitude: drop?.latitude,
        longitude: drop?.longitude,
      });
    }

    if (coordinates.length === 0) return;

    try {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    } catch (error) {
      console.log('Error fitting ', error);
    }
  }

  const fitToMarkersWithDelay = () => {
    setTimeout(() => {
      fitToMarkers();
    }, 500);
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

  useEffect(() => {
    if (drop?.latitude && pickup?.latitude) {
      fitToMarkersWithDelay();
    }
  }, [drop?.latitude, pickup?.latitude, mapRef]);

  useEffect(() => {
    if (pickup?.latitude && drop?.latitude) {
      fetchRoute(pickup, drop, setRouteCoordinates);
    }
  }, [pickup, drop]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        // customMapStyle={customMapStyle}
        pitchEnabled={false}
        followsUserLocation
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
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="red"
            strokeWidth={5}
          />
        )}

        {drop.latitude && pickup?.latitude && (
          <MapViewDirectiions
            origin={pickup}
            destination={drop}
            apikey={apiKey}
            strokeWidth={5}
            precision="high"
            onReady={() => fitToMarkersWithDelay()}
            strokeColor="red"
            onError={(err) => {
              console.log('Direction Error ', err);
            }}
          />
        )}

        {pickup?.latitude && (
          <Marker
            title="Pickup"
            flat
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
            title="Drop"
            flat
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
      </MapView>

      <TouchableOpacity style={mapStyles.gpsButton} onPress={fitToMarkers}>
        <MaterialCommunityIcons
          name="crosshairs-gps"
          size={RFValue(16)}
          color="#3c75BE"
        />
      </TouchableOpacity>
    </View>
  );
};

export default memo(RoutesMap);
