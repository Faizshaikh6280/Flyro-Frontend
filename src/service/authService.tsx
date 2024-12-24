import { useCaptainStore } from '@/store/captainStore';
import { tokenStorage } from '@/store/storage';
import { useUserStorage } from '@/store/userStore';
import { resetAndNavigate } from '@/utils/Helpers';
import { appAxios } from './apiInterceptors';
import { Alert } from 'react-native';

export const logout = async () => {
  const { clearData } = useUserStorage.getState();
  const { clearCaptainData } = useCaptainStore.getState();

  tokenStorage.clearAll();

  clearCaptainData();
  clearData();
  resetAndNavigate('/role');
};

export const signin = async (
  payload: {
    role: 'customer' | 'captain';
    phone: string;
  },
  updateAccessToken: () => void
) => {
  try {
    const { setUser } = useUserStorage.getState();
    const { setUser: setCaptainUser } = useCaptainStore.getState();
    const res = await appAxios.post(`/auth/signin`, payload);

    if (res.data.user.role === 'customer') {
      setUser(res.data.user);
    } else {
      setCaptainUser(res.data.user);
    }

    const new_access_token = res.data.access_token;
    const new_refresh_token = res.data.refresh_token;

    tokenStorage.setItem('access_token', new_access_token);
    tokenStorage.setItem('refresh_token', new_refresh_token);

    if (res.data.user.role === 'customer') {
      resetAndNavigate('/customer/home');
    } else {
      resetAndNavigate('/captain/home');
    }
    updateAccessToken();
  } catch (error: any) {
    console.log(error);

    Alert.alert('Oh! dang there was an error');
    console.log('Error: ', error?.response?.data?.msg || 'Error siging user');
  }
};

export const refresh_tokens = async () => {
  try {
    const refreshToken = await tokenStorage.getItem('refresh_token');

    const response = await appAxios.post(`/auth/refresh-token`, {
      refresh_token: refreshToken,
    });

    const new_access_token = response.data.access_token;
    const new_refresh_token = response.data.refresh_token;

    tokenStorage.setItem('access_token', new_access_token);
    tokenStorage.setItem('refresh_token', new_refresh_token);

    return new_access_token;
  } catch (error) {
    console.error('REFRESH_TOKEN_ERROR');
    tokenStorage.clearAll();
    resetAndNavigate('/role');
    logout();
  }
};
