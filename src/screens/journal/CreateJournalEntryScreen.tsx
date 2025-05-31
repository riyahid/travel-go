import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, Image, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createJournalEntry } from '../../store/slices/journalSlice';
import { fetchTrips } from '../../store/slices/tripSlice'; // To get trips for selection
// import * as ImagePicker from 'expo-image-picker';
// import DateTimePicker from '@react-native-community/datetimepicker'; // Optional: for date picker

// Placeholder for navigation hook
// import { useNavigation } from '@react-navigation/native';

const CreateJournalEntryScreen = ({ route }) => {
  // const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { trips, loading: tripsLoading } = useSelector((state: RootState) => state.trips);
  const { loading: journalLoading, error: journalError } = useSelector((state: RootState) => state.journal);

  const preselectedTripId = route.params?.tripId;

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today YYYY-MM-DD
  const [locationName, setLocationName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]); // Array of local image URIs
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>(preselectedTripId);

  // For DatePicker
  // const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTrips(user.id)); // Fetch trips if user is available
    }
    if (preselectedTripId) {
      setSelectedTripId(preselectedTripId);
    }
  }, [dispatch, user, preselectedTripId]);

  // Placeholder for image picker handler
  const handleChoosePhoto = async () => {
    Alert.alert("Image Picker", "Image picker functionality to be implemented. Please install expo-image-picker.");
    // Example using expo-image-picker:
    // try {
    //   const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //   if (permissionResult.granted === false) {
    //     Alert.alert("Permission Denied", "Permission to access camera roll is required!");
    //     return;
    //   }
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //     allowsEditing: true,
    //     aspect: [4, 3],
    //     quality: 1,
    //   });
    //   if (!result.canceled && result.assets && result.assets.length > 0) {
    //     setPhotos([...photos, result.assets[0].uri]);
    //   }
    // } catch (error) {
    //   Alert.alert("Image Picker Error", "An error occurred while picking images.");
    //   console.error(error);
    // }
  };

  const handleRemovePhoto = (uri: string) => {
    setPhotos(photos.filter(p => p !== uri));
  };

  const handleSaveEntry = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an entry.');
      return;
    }
    if (!selectedTripId) {
      Alert.alert('Error', 'Please select a trip for this journal entry.');
      return;
    }
    if (!title.trim() || !text.trim() || !date.trim()) {
      Alert.alert('Error', 'Please fill in title, text, and date.');
      return;
    }

    const entryDataToSave = { // Renamed to avoid conflict with state variable 'date'
      userId: user.id,
      tripId: selectedTripId,
      title: title.trim(),
      text: text.trim(),
      date: date, // Ensure this is the ISO string from state
      location: locationName.trim() ? { name: locationName.trim() } : undefined,
      // photos are passed as localPhotoUris to the thunk
    };

    try {
      // Ensure entryDataToSave is correctly typed for the thunk
      await dispatch(createJournalEntry({ entryData: entryDataToSave as any, localPhotoUris: photos })).unwrap();
      Alert.alert('Success', 'Journal entry saved!');
      setTitle('');
      setText('');
      setDate(new Date().toISOString().split('T')[0]);
      setLocationName('');
      setPhotos([]);
      // setSelectedTripId(undefined); // Optionally reset selected trip
      // navigation.goBack(); // Or navigate to journal list
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save journal entry.');
      console.error("Save entry error:", e);
    }
  };

  // const onDateChange = (event: any, selectedDate?: Date) => {
  //   const currentDate = selectedDate || new Date(date); // Use current state 'date'
  //   setShowDatePicker(Platform.OS === 'ios');
  //   setDate(currentDate.toISOString().split('T')[0]);
  // };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Select Trip:</Text>
      {tripsLoading && <Text>Loading trips...</Text>}
      {!tripsLoading && trips.length === 0 && <Text>No trips found. Create a trip first!</Text>}
      {/* Basic Trip Selector (Consider replacing with a Picker component for better UX) */}
      <View style={styles.tripSelectorContainer}>
        {trips.map(trip => (
          <Button
            key={trip.id}
            title={`${trip.title} ${selectedTripId === trip.id ? '✓' : ''}`}
            onPress={() => setSelectedTripId(trip.id)}
            color={selectedTripId === trip.id ? 'green' : Platform.OS === 'ios' ? '#007AFF' : 'gray'}
          />
        ))}
      </View>
       {!selectedTripId && trips.length > 0 && <Text style={styles.errorText}>Please select a trip.</Text>}


      <Text style={styles.label}>Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="My Amazing Day"
      />

      <Text style={styles.label}>Date:</Text>
      {/* Simple text input for date. Consider using DateTimePicker for better UX */}
      {/* <Button onPress={() => setShowDatePicker(true)} title={`Selected Date: ${date}`} />
      {showDatePicker && (
        <DateTimePicker
          value={new Date(date)} // Ensure 'date' state is a valid date string for Date constructor
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )} */}
       <TextInput
        style={styles.input}
        value={date} // This should be the ISO string date "YYYY-MM-DD"
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />


      <Text style={styles.label}>Text / Notes:</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={text}
        onChangeText={setText}
        placeholder="Today I explored..."
        multiline
        numberOfLines={5}
      />

      <Text style={styles.label}>Location Name (Optional):</Text>
      <TextInput
        style={styles.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="E.g., Eiffel Tower, Paris"
      />

      <Button title="Choose Photos from Library" onPress={handleChoosePhoto} />
      <View style={styles.photosContainer}>
        {photos.map((uri) => (
          <View key={uri} style={styles.photoPreview}>
            <Image source={{ uri }} style={styles.thumbnail} />
            <Button title="Remove" onPress={() => handleRemovePhoto(uri)} />
          </View>
        ))}
      </View>

      <View style={styles.saveButtonContainer}>
        <Button
          title={journalLoading ? "Saving..." : "Save Entry"}
          onPress={handleSaveEntry}
          disabled={journalLoading || !selectedTripId}
          color="#28a745"
        />
      </View>
      {journalError && <Text style={styles.errorText}>Error: {journalError}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f4f4',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '600', // Bolder
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd', // Softer border
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 10,
    borderRadius: 8, // More rounded
    marginBottom: 12, // Increased margin
    backgroundColor: 'white',
    fontSize: 16,
  },
  multilineInput: {
    height: 120, // Increased height
    textAlignVertical: 'top',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 15,
  },
  photoPreview: {
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 6, // Slightly more rounded
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  tripSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 10,
    gap: 8, // Adds spacing between buttons
  },
  saveButtonContainer: {
    marginTop: 20,
    marginBottom: 40, // More space at the bottom
  }
});

export default CreateJournalEntryScreen;