import { View, Text, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import { Colors } from '@/utils/Constants';
import { RFValue } from 'react-native-responsive-fontsize';
import { useFonts } from 'expo-font';

const fontSizes = {
  h1: 24, // Largest heading
  h2: 22,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
  h7: 12,
  h8: 10, // Smallest heading
};

const CustomText: FC<CustomTextProps> = ({
  variant = 'h1',
  style,
  fontSize,
  children,
  fontFamily = 'Regular',
  numberOfLines,
}) => {
  // const [fontsLoaded] = useFonts({
  //   'NotoSans-Medium': require('@/assets/fonts/NotoSans-Medium.ttf'),
  // });

  // if (!fontsLoaded) {
  //   return null;
  // }
  return (
    <View>
      <Text
        style={[
          styles.text,
          {
            fontSize: RFValue(fontSize ? fontSize : fontSizes[variant]),
            fontFamily: `${fontFamily}`,
          },
          style,
        ]}
        numberOfLines={numberOfLines ? numberOfLines : undefined}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: Colors.text,
    textAlign: 'left',
  },
});

export default CustomText;
