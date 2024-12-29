import { Alert } from 'react-native';
import { appAxios } from './apiInterceptors';
import { router } from 'expo-router';

interface coords {
  address: string;
  latitude: number;
  longitude: number;
}

export const createRide = async function (payload: {
  vehicle: 'bike' | 'auto' | 'cabEconomy' | 'cabPremium';
  pickup: coords;
  drop: coords;
}) {
  try {
    const res = await appAxios.post('/ride/create', payload);
    router?.navigate({
      pathname: '/customer/liveride',
      params: {
        id: res?.data?.ride?._id,
      },
    });
  } catch (error) {
    Alert.alert('Oh! Dang there was an error');
    console.log('Error : Create Ride', error);
  }
};
