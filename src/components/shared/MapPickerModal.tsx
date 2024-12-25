import { View, Text, Modal, TouchableOpacity, Image } from 'react-native';
import React, { FC, memo, useEffect, useRef, useState } from 'react';
import { modalStyles } from '@/styles/modalStyles';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import { getPlacesSuggestions, reverseGeocode } from '@/utils/mapUtils';
import MapView, { Region } from 'react-native-maps';
import { useUserStorage } from '@/store/userStore';
import LocationItem from './LocationItem';
import { indiaIntialRegion } from '@/utils/CustomMap';
import { mapStyles } from '@/styles/mapStyles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Location from 'expo-location';

interface MapPickerInterface {
  selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  title: string;
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: any) => void;
}

const MapPickerModal: FC<MapPickerInterface> = ({
  selectedLocation,
  title,
  visible,
  onClose,
  onSelectLocation,
}) => {
  const mapRef = useRef<MapView>(null);
  const [text, setText] = useState('');
  const { location, setLocation } = useUserStorage();
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState<Region | null>(null);
  const [suggestLocations, setSuggestLocations] = useState([]);
  const textInputRef = useRef<TextInput>(null);

  async function fetchLocation(location: string) {
    if (location?.length < 4) {
      setSuggestLocations([]);
      return;
    }

    const locations = await getPlacesSuggestions(location);
    setSuggestLocations(locations);
  }

  async function addLocation({ item: location }: any) {
    if (location) {
      const newRegion = {
        latitude: parseFloat(location.latlon[0]),
        longitude: parseFloat(location.latlon[1]),
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      mapRef?.current?.fitToCoordinates(
        [{ latitude: newRegion.latitude, longitude: newRegion.longitude }],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
      setTimeout(() => {
        mapRef?.current?.animateToRegion(newRegion, 500);
      }, 1000);

      setRegion(newRegion);
      setAddress(location.description);
    }
    textInputRef.current?.blur();
    setText('');
  }

  function renderLocation(item: any) {
    return (
      <LocationItem
        item={item}
        onPress={() => {
          addLocation(item);
        }}
      ></LocationItem>
    );
  }

  async function handleRegionChangeComplete(newRegion: Region) {
    try {
      const address = await reverseGeocode(
        newRegion?.latitude,
        newRegion?.longitude
      );
      setRegion(newRegion);
      setAddress(address);
    } catch (error) {
      console.log(error);
    }
  }

  const hanleGpsButtonPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === 'granted') {
      try {
        const location = await Location.getCurrentPositionAsync({});

        const { latitude, longitude } = location.coords;

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };

        mapRef?.current?.fitToCoordinates(
          [{ latitude: newRegion.latitude, longitude: newRegion.longitude }],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );

        setTimeout(() => {
          mapRef?.current?.animateToRegion(newRegion, 500);
        }, 1000);

        const address = await reverseGeocode(
          newRegion.latitude,
          newRegion.longitude
        );

        if (title === 'pickup') {
          setLocation({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
            address: address,
          });
        }
      } catch (error) {
        console.log('Error getting current location', error);
      }
    } else {
      console.log('Permission to access location was denied');
    }
  };

  useEffect(() => {
    const newRegion = {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };

    mapRef?.current?.fitToCoordinates(
      [{ latitude: newRegion.latitude, longitude: newRegion.longitude }],
      {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      }
    );
    // After fitting, zoom in further
    setTimeout(() => {
      mapRef?.current?.animateToRegion(newRegion, 500);
    }, 1000);

    setRegion(newRegion);
    setAddress(selectedLocation.address);
  }, [selectedLocation, mapRef]);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalContainer}>
        <Text style={modalStyles.centerText}>Select {title}</Text>

        <TouchableOpacity onPress={onClose}>
          <Text style={modalStyles.cancelButton}>Cancel</Text>
        </TouchableOpacity>

        <View style={modalStyles.searchContainer}>
          <Ionicons name="search-outline" size={RFValue(16)} color={'#777'} />
          <TextInput
            ref={textInputRef}
            style={modalStyles?.input}
            placeholder="Search address"
            placeholderTextColor={'#aaa'}
            value={text}
            onChangeText={(e) => {
              setText(e);
              fetchLocation(e);
            }}
          />
        </View>
        {text !== '' ? (
          <FlatList
            ListHeaderComponent={
              <View>
                {text.length >= 4 ? null : (
                  <Text style={{ marginHorizontal: 16, color: 'red' }}>
                    Enter at least 4 characters to search
                  </Text>
                )}
              </View>
            }
            data={suggestLocations}
            renderItem={renderLocation}
            keyExtractor={(item: any) => `${item?.place_id}-${Math.random()}`}
            initialNumToRender={5}
            windowSize={5}
          />
        ) : (
          <>
            <View style={{ flex: 1, width: '100%' }}>
              <MapView
                ref={mapRef}
                maxZoomLevel={18}
                minZoomLevel={12}
                pitchEnabled={false}
                onRegionChangeComplete={handleRegionChangeComplete}
                initialRegion={{
                  latitude:
                    region?.latitude ??
                    location?.latitude ??
                    indiaIntialRegion.latitude,
                  longitude:
                    region?.longitude ??
                    location?.longitude ??
                    indiaIntialRegion.longitude,
                  latitudeDelta: 0.5,
                  longitudeDelta: 0.5,
                }}
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
                  source={
                    title === 'drop'
                      ? require('@/assets/icons/drop_marker.png')
                      : require('@/assets/icons/marker.png')
                  }
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
            </View>
            <View style={modalStyles?.footerContainer}>
              <Text style={modalStyles.addressText} numberOfLines={2}>
                {address === '' ? 'Getting address...' : address}
              </Text>
              <View style={modalStyles.buttonContainer}>
                <TouchableOpacity
                  style={modalStyles.button}
                  onPress={() => {
                    onSelectLocation({
                      type: title,
                      latitude: region?.latitude,
                      longitude: region?.longitude,
                      address: address,
                    });
                    onClose();
                  }}
                >
                  <Text style={modalStyles.buttonText}>Set Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

export default memo(MapPickerModal);
