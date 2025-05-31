import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AppDispatch } from '../../store';
import { addActivity } from '../../store/slices/tripSlice';
import { TripStackParamList } from '../../navigation/types';
import { Activity, ActivityType } from '../../types';
import Button from '../../components/Button';

type AddActivityScreenNavigationProp = NativeStackNavigationProp<TripStackParamList, 'AddActivity'>;
type AddActivityScreenRouteProp = RouteProp<TripStackParamList, 'AddActivity'>;

const activityTypes: ActivityType[] = [
  'sightseeing',
  'food',
  'transportation',
  'accommodation',
  'entertainment',
  'shopping',
  'other',
];

export default function AddActivityScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<AddActivityScreenNavigationProp>();
  const route = useRoute<AddActivityScreenRouteProp>();
  const { tripId, date } = route.params;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('sightseeing');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddActivity = async () => {
    if (!title || !startTime || !endTime || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const activity: Omit<Activity, 'id'> = {
        title,
        type,
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`,
        location: {
          id: Date.now().toString(), // This should be replaced with proper ID generation
          name: location,
          address: location,
          coordinates: {
            latitude: 0, // These should be fetched from a geocoding service
            longitude: 0,
          },
        },
        cost: cost ? parseFloat(cost) : undefined,
        notes,
        status: 'planned',
      };

      await dispatch(addActivity({ tripId, activity })).unwrap();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Activity Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter activity title"
        />

        <Text style={styles.label}>Type *</Text>
        <View style={styles.typeContainer}>
          {activityTypes.map((activityType) => (
            <Button
              key={activityType}
              title={activityType.charAt(0).toUpperCase() + activityType.slice(1)}
              variant={type === activityType ? 'primary' : 'outline'}
              onPress={() => setType(activityType)}
              style={styles.typeButton}
            />
          ))}
        </View>

        <Text style={styles.label}>Start Time *</Text>
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="HH:mm"
        />

        <Text style={styles.label}>End Time *</Text>
        <TextInput
          style={styles.input}
          value={endTime}
          onChangeText={setEndTime}
          placeholder="HH:mm"
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />

        <Text style={styles.label}>Cost</Text>
        <TextInput
          style={styles.input}
          value={cost}
          onChangeText={setCost}
          placeholder="Enter cost"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter notes"
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttons}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.button}
          />
          <Button
            title="Add Activity"
            onPress={handleAddActivity}
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -4,
  },
  typeButton: {
    margin: 4,
    flex: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
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