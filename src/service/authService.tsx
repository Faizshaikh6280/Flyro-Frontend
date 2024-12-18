import { useCaptainStore } from '@/store/captainStore';
import { tokenStorage } from '@/store/storage';
import { useUserStorage } from '@/store/userStore';
import { resetAndNavigate } from '@/utils/Helpers';
import axios from 'axios';
import { Alert } from 'react-native';
import { BASE_URL } from './config';

export const logout = async () => {
  const { clearData } = useUserStorage.getState();
  const { clearCaptainData } = useCaptainStore.getState();

  tokenStorage.clearAll();
  clearCaptainData();
  clearData();
  resetAndNavigate('/role');
};

export const signin = async (payload: {
  role: 'customer' | 'captain';
  phone: string;
}) => {
  const { setUser } = useUserStorage.getState();
  const { setUser: setCaptainUser } = useCaptainStore.getState();

  const res = await axios.post(`${BASE_URL}/auth/signin`, payload);

  if (res.data.user.role === 'customer') {
    setUser(res.data.user);
  } else {
    setCaptainUser(res.data.user);
  }

  const new_access_token = res.data.access_token;
  const new_refresh_token = res.data.refresh_token;

  tokenStorage.set('access_token', new_access_token);
  tokenStorage.set('refresh_token', new_refresh_token);

  if (res.data.user.role === 'customer') {
    resetAndNavigate('/customer/home');
  } else {
    resetAndNavigate('/captain/home');
  }

  try {
  } catch (error: any) {
    Alert.alert('Oh! Dang there was an error ');
    console.log('Error: ', error?.response?.data?.msg || 'Error siging user');
  }
};
