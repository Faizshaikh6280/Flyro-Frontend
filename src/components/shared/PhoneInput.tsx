import { View, Text, StyleSheet, TextInput } from 'react-native';
import React, { FC } from 'react';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from './CustomText';

const PhoneInput: FC<PhoneInputProps> = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
}) => {
  return (
    <View style={style.container}>
      <CustomText fontFamily="Medium" variant="h5" style={style.text}>
        🇮🇳 +91{' '}
      </CustomText>
      <TextInput
        onChangeText={onChangeText}
        value={value}
        onBlur={onBlur}
        onFocus={onFocus}
        maxLength={12}
        keyboardType="phone-pad"
        placeholder="XXXXXXXXXXX"
        placeholderTextColor="#ccc"
        style={style.input}
      />
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 14,
    marginVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    color: '#222',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  input: {
    fontSize: RFValue(13),
    fontFamily: 'NotoSans-Medium',
    height: 45,
    width: '90%',
  },
  text: {
    fontSize: RFValue(13),
    top: -1,
    fontFamily: 'NotoSans-Medium',
  },
});

export default PhoneInput;
