import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { roleStyles } from '@/styles/roleStyles';
import CustomText from '@/components/shared/CustomText';
import { useRouter } from 'expo-router';

const Role = () => {
  const router = useRouter();

  function handleCustomerPress() {
    router.navigate('/customer/auth');
  }

  function handleCaptainPress() {
    router.navigate('/captain/auth');
  }

  return (
    <View style={roleStyles.container}>
      <Image
        source={require('@/assets/images/logo_t.png')}
        style={roleStyles.logo}
      />
      <CustomText fontFamily="Medium" variant="h6">
        Choose your user type
      </CustomText>
      <TouchableOpacity style={roleStyles.card} onPress={handleCustomerPress}>
        <Image
          source={require('@/assets/images/customer.png')}
          style={roleStyles.image}
        />
        <View style={roleStyles.cardContent}>
          <Text style={roleStyles.title}>Customer</Text>
          <Text style={roleStyles.description}>
            Are you a customer? Order rides and deliveries easily.
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={roleStyles.card} onPress={handleCaptainPress}>
        <Image
          source={require('@/assets/images/captain.png')}
          style={roleStyles.image}
        />
        <View style={roleStyles.cardContent}>
          <Text style={roleStyles.title}>Captain</Text>
          <Text style={roleStyles.description}>
            Are you a captain? Join us to drive and deliver.
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Role;
