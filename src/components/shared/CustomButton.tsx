import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { FC } from 'react';
import { Colors } from '@/utils/Constants';
import CustomText from './CustomText';
import { RFValue } from 'react-native-responsive-fontsize';

const CustomButton: FC<CustomButtonProps> = ({
  loading,
  disabled,
  onPress,
  title,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        style.container,
        { backgroundColor: disabled ? Colors.secondary : Colors.primary },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.text} />
      ) : (
        <CustomText
          fontFamily="SemiBold"
          style={{
            fontSize: RFValue(12),
            color: disabled ? '#fff' : Colors.text,
          }}
        >
          {title}
        </CustomText>
      )}
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  container: {
    borderRadius: 10,
    margin: 10,
    padding: 10,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});

export default CustomButton;
