import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },

  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key);
    return value ?? null;
  },

  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const storage = {
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },

  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key);
    return value ?? null;
  },

  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};
