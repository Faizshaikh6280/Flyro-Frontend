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

const Selectlocation = () => {
  const [pickup, setPickup] = useState<string>('');
  const [drop, setDrop] = useState<string>('');
  const { location } = useUserStorage();
  const [pickupCoords, setPickupCoords] = useState<any>(null);
  const [dropCoords, setDropCoords] = useState<any>(null);

  const [suggestLocation, setSuggestLocation] = useState<any>([]);
  const [focusedInput, setFocusedInput] = useState('pickup');

  const [modalTitle, setMapTitle] = useState('drop');
  const [isMapModalVisible, setMapModalVisible] = useState(false);

  const [selection, setSelection] = useState<any>({ start: 0, end: 0 });

  async function addLocation(placeId: string) {}

  function renderLocation(item: any) {
    return (
      <LocationItem
        item={item}
        onPress={() => {
          addLocation(item.place_id);
        }}
      ></LocationItem>
    );
  }

  async function fetchLocation(location: string) {
    if (location?.length < 4) return;

    const locations = await getPlacesSuggestions(location);

    setSuggestLocation(locations);
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
            // call api for auto complete
          }}
          onFocus={() => {
            setFocusedInput('pickup');
            setSelection(null);
          }}
          // autoFocus={true}
          cursorColor={'green'}
          selection={selection}
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
          autoFocus
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
        data={suggestLocation}
        renderItem={renderLocation}
        keyExtractor={(item: any) => `${item?.place_id}`}
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
    </View>
  );
};

export default Selectlocation;
