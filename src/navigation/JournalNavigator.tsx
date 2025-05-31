import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { JournalStackParamList } from './types';
import { useNavigation } from '@react-navigation/native';

// Import screens
import JournalListScreen from '../screens/journal/JournalListScreen';
import JournalEntryScreen from '../screens/journal/JournalEntryScreen';
import CreateJournalEntryScreen from '../screens/journal/CreateJournalEntryScreen';
import EditJournalEntryScreen from '../screens/journal/EditJournalEntryScreen';

const Stack = createNativeStackNavigator<JournalStackParamList>();

export default function JournalNavigator() {
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
        name="JournalList"
        component={JournalListScreen}
        options={{
          title: 'Travel Journal',
          headerRight: () => (
            <Icon
              name="plus"
              size={24}
              color="#212529"
              onPress={() => navigation.navigate('CreateJournalEntry' as never)}
            />
          ),
        }}
      />
      <Stack.Screen
        name="JournalEntry"
        component={JournalEntryScreen}
        options={{
          title: 'Journal Entry',
        }}
      />
      <Stack.Screen
        name="CreateJournalEntry"
        component={CreateJournalEntryScreen}
        options={{
          title: 'New Entry',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EditJournalEntry"
        component={EditJournalEntryScreen}
        options={{
          title: 'Edit Entry',
        }}
      />
    </Stack.Navigator>
  );
} 