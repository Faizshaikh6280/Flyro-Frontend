import { screenHeight, screenWidth } from '@/utils/Constants';
import { StyleSheet } from 'react-native';

export const splashStyles = StyleSheet.create({
  img: {
    width: screenWidth * 0.8,
    height: screenHeight * 0.6,
    resizeMode: 'contain',
  },
  text: {
    position: 'absolute',
    bottom: -140,
    left: -72,
  },
});
