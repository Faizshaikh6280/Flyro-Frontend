import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvStorage } from './storage';

type CustomLocation = {
  latitude: number;
  longitude: number;
  address: string;
  heading: Number;
} | null;

interface CaptainStoreProps {
  user: any;
  location: CustomLocation;
  onDuty: boolean;
  setUser: (data: any) => void;
  setLocation: (data: CustomLocation) => void;
  clearCaptainData: () => void;
}

export const useCaptainStore = create<CaptainStoreProps>()(
  persist(
    (set, get) => ({
      user: null,
      location: null,
      onDuty: false,
      setUser: (data) => set({ user: data }),
      setLocation: (data) => set({ location: data }),
      clearCaptainData: () =>
        set({ user: null, location: null, onDuty: false }),
    }),
    {
      name: 'user-store', // Key for persisted data
      partialize: (state) => ({ user: state.user }), // Only persist the user property
      storage: createJSONStorage(() => mmkvStorage), // Use MMKV for storage
    }
  )
);
