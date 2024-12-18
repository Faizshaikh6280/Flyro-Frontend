import * as SecureStore from 'expo-secure-store';

// SecureStore-based token storage

const TOKEN_KEYS_META = 'token-keys-meta';

export const tokenStorage = {
  setItem: async (key: string, value: any) => {
    try {
      // Save the value
      await SecureStore.setItemAsync(`token-${key}`, value);

      // Update the list of token keys
      const existingKeys = await SecureStore.getItemAsync(TOKEN_KEYS_META);
      const keys = existingKeys ? JSON.parse(existingKeys) : [];
      if (!keys.includes(key)) {
        keys.push(key);
        await SecureStore.setItemAsync(TOKEN_KEYS_META, JSON.stringify(keys));
      }
    } catch (error) {
      console.error('Failed to set token:', error);
    }
  },

  getItem: async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(`token-${key}`);
      return value ?? null;
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  },

  removeItem: async (key: string) => {
    try {
      // Remove the key from Secure Store
      await SecureStore.deleteItemAsync(`token-${key}`);

      // Update the list of token keys
      const existingKeys = await SecureStore.getItemAsync(TOKEN_KEYS_META);
      const keys = existingKeys ? JSON.parse(existingKeys) : [];

      const updatedKeys = keys.filter((k: string) => k !== key);

      await SecureStore.setItemAsync(
        TOKEN_KEYS_META,
        JSON.stringify(updatedKeys)
      );
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  clearAll: async () => {
    try {
      // Get all keys from the meta-key
      const existingKeys = await SecureStore.getItemAsync(TOKEN_KEYS_META);
      const keys = existingKeys ? JSON.parse(existingKeys) : [];

      // Delete each key
      for (const key of keys) {
        await SecureStore.deleteItemAsync(`token-${key}`);
      }

      // Clear the meta-key
      await SecureStore.deleteItemAsync(TOKEN_KEYS_META);
    } catch (error) {
      console.error('Failed to clear all tokens:', error);
    }
  },
};

// SecureStore-based general storage
export const appStorage = {
  setItem: async (key: string, value: any) => {
    try {
      await SecureStore.setItemAsync(`app-${key}`, value);
    } catch (error) {
      console.error('Failed to set item:', error);
    }
  },

  getItem: async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(`app-${key}`);
      return value ?? null;
    } catch (error) {
      console.error('Failed to get item:', error);
      return null;
    }
  },

  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(`app-${key}`);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  },
};
