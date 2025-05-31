import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { createFoodLogEntry } from '../../store/slices/foodLogSlice';
import { fetchTrips } from '../../store/slices/tripSlice'; // Optional: for trip selection
// import * as ImagePicker from 'expo-image-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';

// Placeholder for navigation hook
// import { useNavigation } from '@react-navigation/native';

const CreateFoodLogScreen = ({ route }) => {
  // const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  // const { trips, loading: tripsLoading } = useSelector((state: RootState) => state.trips); // Optional
  const { loading: foodLogLoading, error: foodLogError } = useSelector((state: RootState) => state.foodLog);

  const preselectedTripId = route.params?.tripId; // Optional

  const [mealDescription, setMealDescription] = useState('');
  const [rating, setRating] = useState<number>(0); // 0 or some default
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [restaurantName, setRestaurantName] = useState('');
  const [locationName, setLocationName] = useState(''); // General location
  const [photos, setPhotos] = useState<string[]>([]); // Local image URIs
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>(preselectedTripId);

  // For DatePicker
  // const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch trips if linking to trips is desired - uncomment if needed
  // useEffect(() => {
  //   if (user?.id) {
  //     dispatch(fetchTrips(user.id));
  //   }
  //   if (preselectedTripId) {
  //     setSelectedTripId(preselectedTripId);
  //   }
  // }, [dispatch, user, preselectedTripId]);

  const handleChoosePhoto = async () => {
    Alert.alert("Image Picker", "Image picker functionality to be implemented. Please install expo-image-picker.");
    // Example with expo-image-picker
    // try {
    //   const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    //   if (!permissionResult.granted) {
    //     Alert.alert("Permission Denied", "Permission to access camera roll is required.");
    //     return;
    //   }
    //   const result = await ImagePicker.launchImageLibraryAsync({
    //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //     allowsEditing: true,
    //     quality: 1,
    //   });
    //   if (!result.canceled && result.assets && result.assets.length > 0) {
    //     setPhotos([...photos, result.assets[0].uri]);
    //   }
    // } catch (error) {
    //   Alert.alert("Image Picker Error", "An error occurred: " + error.message);
    // }
  };

  const handleRemovePhoto = (uri: string) => {
    setPhotos(photos.filter(p => p !== uri));
  };

  const StarRating = ({ maxStars = 5, currentRating, onRate }) => {
    return (
      <View style={styles.starContainer}>
        {[...Array(maxStars)].map((_, index) => {
          const starNumber = index + 1;
          return (
            <TouchableOpacity key={starNumber} onPress={() => onRate(starNumber)} style={styles.star}>
              <Text style={starNumber <= currentRating ? styles.starFilled : styles.starEmpty}>★</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const handleSaveLog = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }
    if (!mealDescription.trim() || rating === 0 || !date.trim()) {
      Alert.alert('Error', 'Please fill in meal description, rating, and date.');
      return;
    }
    if (rating < 1 || rating > 5) {
      Alert.alert('Error', 'Rating must be between 1 and 5.');
      return;
    }

    const entryData = {
      userId: user.id,
      tripId: selectedTripId, // Optional
      mealDescription: mealDescription.trim(),
      rating,
      date,
      restaurantName: restaurantName.trim() || undefined,
      location: locationName.trim() ? { name: locationName.trim() } : undefined,
    };

    try {
      await dispatch(createFoodLogEntry({ entryData, localPhotoUris: photos })).unwrap();
      Alert.alert('Success', 'Food log saved!');
      // Reset form
      setMealDescription('');
      setRating(0);
      setDate(new Date().toISOString().split('T')[0]);
      setRestaurantName('');
      setLocationName('');
      setPhotos([]);
      // navigation.goBack(); // Or navigate to food log list
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save food log.');
      console.error("Save food log error:", e);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Optional Trip Selector - uncomment if needed
      <Text style={styles.label}>Associated Trip (Optional):</Text>
      {tripsLoading && <Text>Loading trips...</Text>}
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
      */}

      <Text style={styles.label}>Meal Description*:</Text>
      <TextInput
        style={[styles.input, styles.multilineInput]}
        value={mealDescription}
        onChangeText={setMealDescription}
        placeholder="e.g., Delicious pizza with extra cheese"
        multiline
      />

      <Text style={styles.label}>Rating (1-5)*:</Text>
      <StarRating currentRating={rating} onRate={setRating} />
       <TextInput
        style={styles.input}
        value={rating > 0 ? String(rating) : ''}
        onChangeText={(text) => setRating(Number(text))}
        placeholder="Tap stars above or enter 1-5"
        keyboardType="numeric"
      />


      <Text style={styles.label}>Date*:</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Restaurant Name (Optional):</Text>
      <TextInput
        style={styles.input}
        value={restaurantName}
        onChangeText={setRestaurantName}
        placeholder="e.g., The Italian Place"
      />

      <Text style={styles.label}>General Location (Optional):</Text>
      <TextInput
        style={styles.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="e.g., Downtown Cityville"
      />

      <Button title="Choose Photos" onPress={handleChoosePhoto} />
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
          title={foodLogLoading ? "Saving..." : "Save Log"}
          onPress={handleSaveLog}
          disabled={foodLogLoading}
          color="#28a745"
        />
      </View>
      {foodLogError && <Text style={styles.errorText}>Error: {foodLogError}</Text>}
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
    fontWeight: '600',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
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
    borderRadius: 6,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  tripSelectorContainer: { // Optional
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  saveButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  starContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  star: {
    marginHorizontal: 2,
  },
  starFilled: {
    fontSize: 30,
    color: '#FFD700', // Gold
  },
  starEmpty: {
    fontSize: 30,
    color: '#ccc',
  },
});

export default CreateFoodLogScreen;