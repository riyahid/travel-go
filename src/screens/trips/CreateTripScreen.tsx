import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { GOOGLE_MAPS_API_KEY } from '../../config/googleMaps'; // Import API key
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
  // Updated startDate and endDate states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  // Preference states
  const [travelStyle, setTravelStyle] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('USD'); // Default currency

  // State for date picker visibility
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Geocoding function
  interface GeocodingResult {
    latitude: number;
    longitude: number;
  }

  const geocodeDestination = async (destinationName: string, country: string): Promise<GeocodingResult | null> => {
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      console.warn('Google Maps API Key is not configured. Using placeholder coordinates (0,0).');
      // Fallback to placeholder coordinates as per previous behavior if API key is missing
      return { latitude: 0, longitude: 0 };
    }

    const address = `${destinationName}, ${country}`;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        console.error('Geocoding failed:', data.status, data.error_message);
        return null; // Indicates failure to geocode
      }
    } catch (error) {
      console.error('Error fetching geocoding data:', error);
      return null; // Indicates failure
    }
  };

  const onChangeStartDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios'); // On iOS, the picker is a modal, manage visibility accordingly
    if (selectedDate) {
      setStartDate(selectedDate);
      // Optional: if start date is after current end date, clear end date
      if (endDate && selectedDate > endDate) {
        setEndDate(null);
      }
    }
  };

  const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (startDate && selectedDate < startDate) {
        Alert.alert("Invalid Date", "End date cannot be before start date.");
        return;
      }
      setEndDate(selectedDate);
    }
  };

  const handleCreate = async () => {
    // Updated validation for Date objects and other fields
    if (!title || !destinationName || !destinationCountry || !startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all required fields, including valid start and end dates.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a trip');
      return;
    }

    try {
      setLoading(true);

      const coords = await geocodeDestination(destinationName, destinationCountry);

      if (!coords) {
        Alert.alert('Error', 'Could not find coordinates for the destination. Please check the name and country, or ensure your API key is valid.');
        setLoading(false);
        return;
      }

      const destination: Destination = {
        // id: Date.now().toString(), // Consider a more robust ID generation strategy
        // For now, the slice might handle ID generation or Firestore does.
        // Let's assume id is not part of the Destination object passed to the thunk,
        // or the thunk/Firestore handles it.
        // If your Destination type strictly requires an ID here, it needs to be generated.
        // Based on previous code, an ID was generated here. Let's keep it consistent for now.
        id: Date.now().toString(),
        name: destinationName,
        country: destinationCountry,
        address: '', // formattedAddress could be stored here if desired from geocoding result
        coordinates: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      };

      const newTrip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.id,
        title,
        description,
        startDate: startDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0],     // Format to YYYY-MM-DD
        destination,
        preferences: {
          travelStyle: travelStyle || undefined,
          interests: interests.length > 0 ? interests : undefined,
          budgetEstimate: {
            amount: budgetAmount ? parseFloat(budgetAmount) : undefined,
            currency: budgetAmount && budgetCurrency ? budgetCurrency : undefined,
          },
        },
        itinerary: [],
        budget: { // This is for actuals, distinct from budgetEstimate
          total: 0,
          spent: 0,
          currency: 'USD', // Default or could be derived from preference
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
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateDisplay}>
          <Text style={styles.dateText}>{startDate ? startDate.toLocaleDateString() : 'Select Start Date'}</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeStartDate}
            minimumDate={new Date()}
          />
        )}

        <Text style={styles.label}>End Date *</Text>
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateDisplay}>
          <Text style={styles.dateText}>{endDate ? endDate.toLocaleDateString() : 'Select End Date'}</Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || startDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeEndDate}
            minimumDate={startDate || new Date()}
          />
        )}

        {/* Preference Fields */}
        <Text style={styles.label}>Travel Style (Optional)</Text>
        <TextInput
          style={styles.input}
          value={travelStyle}
          onChangeText={setTravelStyle}
          placeholder="e.g., Solo, Family, Backpacking"
        />

        <Text style={styles.label}>Interests (Optional, comma-separated)</Text>
        <TextInput
          style={styles.input}
          value={interests.join(', ')}
          onChangeText={(text) => setInterests(text.split(',').map(interest => interest.trim()).filter(interest => interest))}
          placeholder="e.g., Adventure, Culture, Foodie"
        />

        <Text style={styles.label}>Budget Estimate (Optional)</Text>
        <View style={styles.budgetContainer}>
          <TextInput
            style={[styles.input, styles.budgetAmountInput]}
            value={budgetAmount}
            onChangeText={setBudgetAmount}
            placeholder="Amount"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.budgetCurrencyInput]}
            value={budgetCurrency}
            onChangeText={setBudgetCurrency}
            placeholder="Currency (e.g., USD)"
          />
        </View>

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
  dateDisplay: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#495057', // Color for text, change if needed
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetAmountInput: {
    flex: 2, // Takes more space
    marginRight: 8,
  },
  budgetCurrencyInput: {
    flex: 1, // Takes less space
  }
}); 