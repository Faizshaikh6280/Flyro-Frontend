import { View, Text, Platform, Alert } from 'react-native';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRoute } from '@react-navigation/native';
import { useWS } from '@/service/WSProvider';
import { screenHeight } from '@/utils/Constants';
import { rideStyles } from '@/styles/rideStyles';
import { StatusBar } from 'expo-status-bar';
import { resetAndNavigate } from '@/utils/Helpers';
import LiveTrackingMap from '@/components/customer/LiveTrackingMap';

const androidHeights = [
  screenHeight * 0.2,
  screenHeight * 0.42,
  screenHeight * 0.8,
];
const iosHeights = [screenHeight * 0.2, screenHeight * 0.6];

const LiveRide = () => {
  const { emit, on, off } = useWS();
  const route = useRoute() as any;
  const params = route?.params || {};
  const id = params.id;

  const [rideData, setRideData] = useState<any>(null);
  const [captainCoords, setCaptainCoords] = useState<any>();
  const bottomSheefRef = useRef(null);

  const snapPoints = useMemo(
    () => (Platform.OS === 'ios' ? iosHeights : androidHeights),
    []
  );

  const [mapHeight, setMapHeight] = useState(snapPoints[1]);

  const handleSheetChanges = useCallback((index: number) => {
    let height;
    if (index === 0) {
      height = screenHeight * 0.76;
    } else {
      height = screenHeight * 0.5;
    }
    setMapHeight(height);
  }, []);

  useEffect(() => {
    if (id) {
      emit('subscribeRide', id);

      on('rideData', (data) => {
        setRideData(data);
        if (data?.status === 'SEARCHING_FOR_CAPTAIN') {
          emit('searchCaptain', id);
        }
      });

      on('rideUpdate', (data) => {
        setRideData(data);
      });

      on('rideCanceled', (err) => {
        resetAndNavigate('/customer/home');
        Alert.alert('Ride Cancelled');
      });

      on('error', (error) => {
        resetAndNavigate('/customer/home');
        Alert.alert('Oh Dang! No Riders Found');
      });

      return () => {
        off('rideData');
        off('rideUpdate');
        off('rideCacelled');
        off('error');
      };
    }
  }, [id, emit, on, off]);

  useEffect(() => {
    if (rideData?.captain?._id) {
      emit('subscribeToCaptainLocation', rideData?.captain?._id);
      on('captainLocationUpdate', (data) => {
        setCaptainCoords(data?.coords);
      });
    }

    return () => {
      off('captainLocationUpdate');
    };
  }, [rideData]);
  console.log(rideData);

  return (
    <View style={rideStyles.container}>
      <StatusBar style="light" backgroundColor="orange" translucent={false} />
      {rideData && (
        <LiveTrackingMap
          height={mapHeight}
          status={rideData?.status}
          drop={{
            latitude: parseFloat(rideData?.drop?.latitude),
            longitude: parseFloat(rideData?.drop?.longitude),
          }}
          pickup={{
            latitude: rideData?.pickup?.latitude,
            longitude: rideData?.pickup?.longitude,
          }}
          captain={
            captainCoords
              ? {
                  latitude: captainCoords?.latitude,
                  longitude: captainCoords?.longitude,
                  heading: captainCoords.heading,
                }
              : {}
          }
        />
      )}
    </View>
  );
};

export default memo(LiveRide);
