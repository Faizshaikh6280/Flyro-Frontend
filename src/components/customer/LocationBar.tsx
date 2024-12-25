import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import React from 'react';
import { useUserStorage } from '@/store/userStore';
import { useWS } from '@/service/WSProvider';
import { uiStyles } from '@/styles/uiStyles';
import { RFValue } from 'react-native-responsive-fontsize';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/utils/Constants';
import { router } from 'expo-router';
import CustomText from '@/components/shared/CustomText';

const LocationBar = () => {
  const { location } = useUserStorage();

  const { disconnect } = useWS();

  return (
    <View style={[uiStyles.absoluteTop, { marginTop: 8 }]}>
      <SafeAreaView>
        <View style={uiStyles.container}>
          <TouchableOpacity>
            <Ionicons
              name="menu-outline"
              size={RFValue(18)}
              color={Colors.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={uiStyles.locationBar}
            onPress={() => {
              router.navigate('/customer/selectlocation');
            }}
          >
            <View style={uiStyles.dot} />
            <View style={{ flex: 1, width: '80%' }}>
              <CustomText numberOfLines={1} style={uiStyles.locationText}>
                {location?.address || 'Getting address...'}
              </CustomText>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LocationBar;
