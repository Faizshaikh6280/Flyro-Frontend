import { View, Text, Image, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { commonStyles } from '@/styles/commonStyles';
import { splashStyles } from '@/styles/splashStyles';
import CustomText from '@/components/shared/CustomText';
import { useFonts } from 'expo-font';
import { resetAndNavigate } from '@/utils/Helpers';
import { tokenStorage } from '@/store/storage';
import { jwtDecode } from 'jwt-decode'; // Fixed import
import { refresh_tokens, signin } from '@/service/authService';
import { useUserStorage } from '@/store/userStore';

const Main = () => {
  const [fontsLoaded] = useFonts({
    Bold: require('@/assets/fonts/NotoSans-Bold.ttf'),
    Regular: require('@/assets/fonts/NotoSans-Regular.ttf'),
    Light: require('@/assets/fonts/NotoSans-Light.ttf'),
    SemiBold: require('@/assets/fonts/NotoSans-SemiBold.ttf'),
    Medium: require('@/assets/fonts/NotoSans-Medium.ttf'),
  });

  const [hasNavigated, setHasNavigated] = useState(false);
  const { user } = useUserStorage();

  interface DecodeTokenInterface {
    exp: number;
    iat: number;
    id: string;
    phone: string;
  }

  async function tokenCheck() {
    try {
      const refresh_token = await tokenStorage.getItem('refresh_token');
      const access_token = await tokenStorage.getItem('access_token');

      if (access_token && refresh_token) {
        const accessTokenDecode = jwtDecode<DecodeTokenInterface>(access_token);
        const refresh_tokenDecode =
          jwtDecode<DecodeTokenInterface>(refresh_token);

        const currentTime = Date.now() / 1000;

        if (accessTokenDecode.exp < currentTime) {
          Alert.alert('Session Expired, Login again');
          resetAndNavigate('/role');
          return;
        }

        if (refresh_tokenDecode.exp < currentTime) {
          await refresh_tokens();
        }

        if (user) {
          resetAndNavigate('/customer/home');
        } else {
          resetAndNavigate('/captain/home');
        }
      }

      return;
    } catch (error) {
      console.error('Token check error:', error);
      Alert.alert('Oh error, while loging.Please try again');
    }

    resetAndNavigate('/role');
  }

  useEffect(() => {
    let timeId: NodeJS.Timeout;

    if (fontsLoaded && !hasNavigated) {
      timeId = setTimeout(() => {
        tokenCheck();
        setHasNavigated(true);
      }, 1000);
    }

    return () => clearTimeout(timeId);
  }, [fontsLoaded, hasNavigated]);

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
