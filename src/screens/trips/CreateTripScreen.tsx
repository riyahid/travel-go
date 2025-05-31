import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppDispatch, RootState } from '../../store';
import { createTrip } from '../../store/slices/tripSlice';
import { TripStackParamList } from '../../navigation/types';
import Button from '../../components/Button';
import { Trip, Destination } from '../../types';

type CreateTripScreenNavigationProp = NativeStackNavigationProp<TripStackParamList, 'CreateTrip'>;

export default function CreateTripScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<CreateTripScreenNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !destinationName || !destinationCountry || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a trip');
      return;
    }

    try {
      setLoading(true);

      const destination: Destination = {
        id: Date.now().toString(), // This should be replaced with proper ID generation
        name: destinationName,
        country: destinationCountry,
        coordinates: {
          latitude: 0, // These should be fetched from a geocoding service
          longitude: 0,
        },
      };

      const newTrip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        title,
        description,
        startDate,
        endDate,
        destination,
        itinerary: [],
        budget: {
          total: 0,
          spent: 0,
          currency: 'USD',
          categories: {},
        },
        status: 'planning',
      };

      await dispatch(createTrip(newTrip)).unwrap();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Trip Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter trip title"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter trip description"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Destination Name *</Text>
        <TextInput
          style={styles.input}
          value={destinationName}
          onChangeText={setDestinationName}
          placeholder="Enter destination name"
        />

        <Text style={styles.label}>Country *</Text>
        <TextInput
          style={styles.input}
          value={destinationCountry}
          onChangeText={setDestinationCountry}
          placeholder="Enter country"
        />

        <Text style={styles.label}>Start Date *</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
        />

        <Text style={styles.label}>End Date *</Text>
        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
        />

        <View style={styles.buttons}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Create Trip"
            onPress={handleCreate}
            loading={loading}
            style={styles.button}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 