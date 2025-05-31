import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TripStackParamList } from './types';

// Import screens
import TripListScreen from '../screens/trips/TripListScreen';
import TripDetailsScreen from '../screens/trips/TripDetailsScreen';
import CreateTripScreen from '../screens/trips/CreateTripScreen';
import EditTripScreen from '../screens/trips/EditTripScreen';
import AddActivityScreen from '../screens/trips/AddActivityScreen';
import ActivityDetailsScreen from '../screens/trips/ActivityDetailsScreen';

const Stack = createNativeStackNavigator<TripStackParamList>();

export default function TripNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: '#0066cc',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="TripList"
        component={TripListScreen}
        options={{
          title: 'My Trips',
        }}
      />
      <Stack.Screen
        name="TripDetails"
        component={TripDetailsScreen}
        options={{
          title: 'Trip Details',
        }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{
          title: 'Create Trip',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EditTrip"
        component={EditTripScreen}
        options={{
          title: 'Edit Trip',
        }}
      />
      <Stack.Screen
        name="AddActivity"
        component={AddActivityScreen}
        options={{
          title: 'Add Activity',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="ActivityDetails"
        component={ActivityDetailsScreen}
        options={{
          title: 'Activity Details',
        }}
      />
    </Stack.Navigator>
  );
} 