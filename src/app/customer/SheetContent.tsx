import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import { uiStyles } from '@/styles/uiStyles';
import { router } from 'expo-router';
import CustomText from '@/components/shared/CustomText';
import { commonStyles } from '@/styles/commonStyles';

const SheetContent = () => {
  const cubes = [
    { name: 'Bike', imageUrl: require('@/assets/icons/bike.png') },
    { name: 'Auto', imageUrl: require('@/assets/icons/auto.png') },
    { name: 'Cab Economy', imageUrl: require('@/assets/icons/cab.png') },
    { name: 'Parcel', imageUrl: require('@/assets/icons/parcel.png') },
    {
      name: 'Cab Premium',
      imageUrl: require('@/assets/icons/cab_premium.png'),
    },
  ];

  return (
    <View>
      <TouchableOpacity
        style={uiStyles.searchBarContainer}
        onPress={() => {
          router.navigate('/customer/selectlocation');
        }}
      >
        <Ionicons name="search-outline" size={RFValue(16)} color="black" />
        <CustomText fontFamily="Medium" fontSize={11}>
          Where are you going ?
        </CustomText>
      </TouchableOpacity>

      <View style={[commonStyles.flexRowBetween, { paddingHorizontal: 10 }]}>
        <CustomText fontFamily="Medium" fontSize={11}>
          Explore
        </CustomText>

        <TouchableOpacity
          style={commonStyles.flexRow}
          onPress={() => router.navigate('/customer/selectlocation')}
        >
          <CustomText fontFamily="Regular" fontSize={10}>
            View All
          </CustomText>

          <Ionicons name="chevron-forward" size={RFValue(14)} color="black" />
        </TouchableOpacity>
      </View>

      <View style={[uiStyles.cubes, { marginTop: 40 }]}>
        {cubes?.map((item, index) => {
          return (
            <TouchableOpacity key={index} style={uiStyles.cubeContainer}>
              <View style={uiStyles.cubeIconContainer}>
                <Image source={item?.imageUrl} style={uiStyles.cubeIcon} />
              </View>

              <CustomText
                fontFamily="Medium"
                fontSize={9.5}
                style={{ textAlign: 'center' }}
              >
                {item?.name}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={uiStyles.adSection}>
        <Image
          source={require('@/assets/images/ad_banner.jpg')}
          style={uiStyles.adImage}
        />
      </View>

      <View style={uiStyles.bannerContainer}>
        <Image
          source={require('@/assets/icons/rapido.jpg')}
          style={uiStyles.adImage}
        />
      </View>
    </View>
  );
};

export default SheetContent;
