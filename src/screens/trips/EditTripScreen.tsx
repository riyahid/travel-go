import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store';
import { updateTrip } from '../../store/slices/tripSlice';
import { TripStackParamList } from '../../navigation/types';
import Button from '../../components/Button';

type EditTripScreenNavigationProp = NativeStackNavigationProp<TripStackParamList, 'EditTrip'>;
type EditTripScreenRouteProp = RouteProp<TripStackParamList, 'EditTrip'>;

export default function EditTripScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<EditTripScreenNavigationProp>();
  const route = useRoute<EditTripScreenRouteProp>();
  const { tripId } = route.params;

  const trip = useSelector((state: RootState) =>
    state.trips.trips.find((t) => t.id === tripId)
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trip) {
      setTitle(trip.title);
      setDescription(trip.description || '');
      setDestinationName(trip.destination.name);
      setDestinationCountry(trip.destination.country);
      setStartDate(trip.startDate);
      setEndDate(trip.endDate);
    }
  }, [trip]);

  const handleUpdate = async () => {
    if (!trip) return;

    if (!title || !destinationName || !destinationCountry || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const updates = {
        title,
        description,
        destination: {
          ...trip.destination,
          name: destinationName,
          country: destinationCountry,
        },
        startDate,
        endDate,
      };

      await dispatch(updateTrip({ tripId, updates })).unwrap();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update trip');
    } finally {
      setLoading(false);
    }
  };

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

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
            title="Update Trip"
            onPress={handleUpdate}
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
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 24,
  },
}); 