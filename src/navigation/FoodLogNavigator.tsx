import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FoodLogStackParamList } from './types';
import { useNavigation } from '@react-navigation/native';

// Import screens
import FoodLogListScreen from '../screens/foodLog/FoodLogListScreen';
import FoodLogEntryScreen from '../screens/foodLog/FoodLogEntryScreen';
import CreateFoodLogScreen from '../screens/foodLog/CreateFoodLogScreen';
import EditFoodLogScreen from '../screens/foodLog/EditFoodLogScreen';

const Stack = createNativeStackNavigator<FoodLogStackParamList>();

export default function FoodLogNavigator() {
  const navigation = useNavigation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTintColor: '#212529',
      }}
    >
      <Stack.Screen
        name="FoodLogList"
        component={FoodLogListScreen}
        options={{
          title: 'Food & Drink Log',
          headerRight: () => (
            <Icon
              name="plus"
              size={24}
              color="#212529"
              onPress={() => navigation.navigate('CreateFoodLog' as never)}
            />
          ),
        }}
      />
      <Stack.Screen
        name="FoodLogEntry"
        component={FoodLogEntryScreen}
        options={{
          title: 'Food Entry',
        }}
      />
      <Stack.Screen
        name="CreateFoodLog"
        component={CreateFoodLogScreen}
        options={{
          title: 'Add Food Entry',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EditFoodLog"
        component={EditFoodLogScreen}
        options={{
          title: 'Edit Food Entry',
        }}
      />
    </Stack.Navigator>
  );
} 