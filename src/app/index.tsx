import { View, Text, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { commonStyles } from '@/styles/commonStyles';
import { splashStyles } from '@/styles/splashStyles';
import CustomText from '@/components/shared/CustomText';
import { useFonts } from 'expo-font';
import { resetAndNavigate } from '@/utils/Helpers';

const Main = () => {
  const [fontsLoaded] = useFonts({
    'NotoSans-Bold': require('@/assets/fonts/NotoSans-Bold.ttf'), // Adjust path if needed
    'NotoSans-Regular': require('@/assets/fonts/NotoSans-Regular.ttf'),
    'NotoSans-Light': require('@/assets/fonts/NotoSans-Light.ttf'),
    'NotoSans-SemiBold': require('@/assets/fonts/NotoSans-SemiBold.ttf'),
    'NotoSans-Medium': require('@/assets/fonts/NotoSans-Medium.ttf'),
  });

  const [hasNavigated, setHasNavigated] = useState(false);

  async function tokenCheck() {
    resetAndNavigate('/role');
  }

  useEffect(() => {
    if (fontsLoaded && !hasNavigated) {
      setTimeout(() => {
        tokenCheck();
        setHasNavigated(true);
      }, 1000);
    }
  }, [fontsLoaded]);

  return (
    <View style={commonStyles.container}>
      <Image
        source={require('@/assets/images/logo_t.png')}
        style={splashStyles.img}
      />
      <CustomText variant="h5" fontFamily="Medium" style={splashStyles.text}>
        Made in India 🇮🇳
      </CustomText>
    </View>
  );
};

export default Main;
