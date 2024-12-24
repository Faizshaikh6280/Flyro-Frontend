import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { homeStyles } from '@/styles/homeStyles';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/utils/Constants';
import CustomText from '@/components/shared/CustomText';
import { commonStyles } from '@/styles/commonStyles';
import { router } from 'expo-router';
import { uiStyles } from '@/styles/uiStyles';
import LocationInput from './LocationInput';
import { getPlacesSuggestions } from '@/utils/mapUtils';
import { locationStyles } from '@/styles/locationStyles';
import { useUserStorage } from '@/store/userStore';
import LocationItem from '@/components/shared/LocationItem';
import MapPickerModal from '@/components/shared/MapPickerModal';

const Selectlocation = () => {
  const [pickup, setPickup] = useState<string>('');
  const [drop, setDrop] = useState<string>('');
  const { location, setLocation } = useUserStorage();
  const [pickupCoords, setPickupCoords] = useState<any>(null);
  const [dropCoords, setDropCoords] = useState<any>(null);

  const [suggestLocations, setSuggestLocations] = useState<any>([]);
  const [focusedInput, setFocusedInput] = useState('pickup');

  const [modalTitle, setMapTitle] = useState('drop');
  const [isMapModalVisible, setMapModalVisible] = useState(false);

  async function addLocation({ item: location }: any) {
    // console.log(location);

    if (location.place_id) {
      if (focusedInput === 'drop') {
        setDrop(location?.description);
        setDropCoords({
          latitude: parseFloat(location?.latlon[0]),
          longitude: parseFloat(location?.latlon[1]),
          address: location.description,
        });
      } else {
        setPickup(location?.description);
        setPickupCoords({
          latitude: parseFloat(location?.latlon[0]),
          longitude: parseFloat(location?.latlon[1]),
          address: location.description,
        });

        const newLoc = {
          address: location.description,
          latitude: parseFloat(location.latlon[0]),
          longitude: parseFloat(location.latlon[1]),
        };
        setLocation(newLoc);
      }
    }
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

  async function fetchLocation(location: string) {
    if (location?.length < 4) {
      setSuggestLocations([]);
      return;
    }

    const locations = await getPlacesSuggestions(location);

    setSuggestLocations(locations);
  }

  useEffect(() => {
    if (location) {
      setPickupCoords(location);
      setPickup(location?.address);
    }
  }, [location]);

  return (
    <View style={homeStyles.container}>
      <StatusBar style="light" backgroundColor="orange" translucent={false} />

      <SafeAreaView />

      <TouchableOpacity
        style={[commonStyles.flexRow, { marginTop: 15, marginLeft: 10 }]}
        onPress={() => router.navigate('/customer/home')}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.iosColor} />
        <CustomText
          fontFamily="Regular"
          style={{ color: Colors.iosColor }}
          variant="h6"
        >
          Back
        </CustomText>
      </TouchableOpacity>

      <View style={uiStyles.locationInputs}>
        <LocationInput
          placeholder="Search Pickup Location"
          type="pickup"
          value={pickup}
          onChangeText={(text) => {
            setPickup(text);
            fetchLocation(text);
          }}
          onFocus={() => {
            setFocusedInput('pickup');
          }}
          cursorColor={'green'}
        />
        <LocationInput
          placeholder="Search Drop Location"
          type="drop"
          value={drop}
          onChangeText={(text) => {
            setDrop(text);
            fetchLocation(text);
            // call api for auto complete
          }}
          onFocus={() => setFocusedInput('drop')}
          cursorColor={'red'}
        />
        <CustomText
          fontFamily="Medium"
          fontSize={10}
          style={uiStyles.suggestionText}
        >
          {focusedInput} suggestions
        </CustomText>
      </View>

      <FlatList
        data={suggestLocations}
        renderItem={renderLocation}
        keyExtractor={(item: any) => `${item?.place_id}-${Math.random()}`}
        initialNumToRender={5}
        windowSize={5}
        ListFooterComponent={
          <TouchableOpacity
            style={[commonStyles.flexRow, locationStyles.conatiner]}
            onPress={() => {
              setMapTitle(focusedInput);
              setMapModalVisible(true);
            }}
          >
            <Image
              source={require('@/assets/icons/map_pin.png')}
              style={uiStyles.mapPinIcon}
            />

            <CustomText fontFamily="Medium" fontSize={12}>
              Select from map
            </CustomText>
          </TouchableOpacity>
        }
      />

      <MapPickerModal
        selectedLocation={{
          latitude:
            focusedInput === 'drop'
              ? dropCoords?.latitude
              : pickupCoords?.latitude,
          longitude:
            focusedInput === 'drop'
              ? dropCoords?.longitude
              : pickupCoords?.longitude,
          address:
            focusedInput === 'drop'
              ? dropCoords?.address
              : pickupCoords?.address,
        }}
        title={modalTitle}
        visible={isMapModalVisible}
        onClose={() => setMapModalVisible(false)}
        onSelectLocation={(data: any) => {
          if (data) {
            if (modalTitle === 'drop') {
              setDropCoords(data);
              setDrop(data?.address);
            } else {
              setLocation(data);
              setPickupCoords(data);
              setPickup(data?.address);
            }
          }
        }}
      />
    </View>
  );
};

export default Selectlocation;
