import { tokenStorage } from '@/store/storage';
import React, {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io } from 'socket.io-client';
import { BASE_URL } from './config';
import { refresh_tokens } from './authService';

interface WSService {
  initializeSocket: () => void;
  emit: (event: string, data?: any) => void;
  on: (event: string, cb: (data: any) => void) => void;
  off: (event: string) => void;
  removeListener: (listenerName: string) => void;
  updateAccessToken: () => void;
  disconnect: () => void;
}

const WSContext = createContext<WSService | undefined>(undefined);

export const WSProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socketAccessToken, setSocketAccessToken] = useState<string | null>(
    null
  );

  const socket: any = useRef();
  // get access token from expo-secure storage
  useEffect(() => {
    async function getToken() {
      let token = await tokenStorage.getItem('access_token');
      setSocketAccessToken(token);
    }
    getToken();
  }, []);

  useEffect(() => {
    if (socketAccessToken) {
      if (socket.current) {
        socket.current.disconnect();
      }

      socket.current = io(BASE_URL, {
        transports: ['websocket'],
        withCredentials: true,
        extraHeaders: {
          access_token: socketAccessToken || '',
        },
      });

      socket.current?.connect();

      socket.current.on('connect_error', (err: any) => {
        if (err.message === 'Authentication error') {
          console.log('Auth connection Error  : ', err);
          refresh_tokens();
        }
      });
    }

    return () => {
      socket.current?.disconnect();
    };
  }, [socketAccessToken]);

  const emit = (event: string, data: any = {}) => {
    socket.current?.emit(event, data);
  };

  const on = (event: string, cb: (data: any) => void) => {
    socket.current?.on(event, cb);
  };

  const off = (event: string) => {
    socket.current?.off(event);
  };

  const removeListener = (listenerName: string) => {
    socket?.current?.removeListener(listenerName);
  };

  const disconnect = () => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = undefined;
    }
  };

  const updateAccessToken = () => {
    const token = tokenStorage.getItem('access_token') as any;
    setSocketAccessToken(token);
  };

  const socketServices: WSService = {
    initializeSocket: () => {},
    emit,
    off,
    on,
    updateAccessToken,
    disconnect,
    removeListener,
  };

  return (
    <WSContext.Provider value={socketServices}>{children}</WSContext.Provider>
  );
};

export const useWS = function () {
  const context = useContext(WSContext);

  if (!context) {
    throw new Error('WSService Context is used outside of provider');
  }
  return context;
};
