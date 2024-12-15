import {
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { authStyles } from '@/styles/authStyles';
import { commonStyles } from '@/styles/commonStyles';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import CustomText from '@/components/shared/CustomText';
import PhoneInput from '@/components/shared/PhoneInput';
import CustomButton from '@/components/shared/CustomButton';

const auth = () => {
  const [phoneText, setPhoneText] = useState('');

  function hanldeNext() {}

  return (
    <SafeAreaView style={[authStyles.container]}>
      <ScrollView contentContainerStyle={authStyles.container}>
        <View style={commonStyles.flexRowBetween}>
          <Image
            source={require('@/assets/images/logo_t.png')}
            style={authStyles.logo}
          />

          <TouchableOpacity style={commonStyles.flexRowGap}>
            <MaterialIcons name="help" size={24} color="black" />
            <CustomText fontFamily="Medium" variant="h6">
              Help
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View>
            <CustomText variant="h5" fontFamily="Medium">
              What's your phone no?
            </CustomText>
            <CustomText variant="h7">Enter your phone no to proceed</CustomText>
            <PhoneInput value={phoneText} onChangeText={setPhoneText} />
          </View>

          <View>
            <CustomText
              variant="h8"
              fontFamily="Regular"
              style={[
                commonStyles.lightText,
                { textAlign: 'center', marginHorizontal: 20 },
              ]}
            >
              By continuing, you agree to the terms and privacy policy of Flyro.
            </CustomText>
            <CustomButton
              disabled={false}
              loading={false}
              title="Next"
              onPress={hanldeNext}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default auth;
