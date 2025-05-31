import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Button, Alert, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { FoodLogEntry } from '../../types';
// import { deleteFoodLogEntry } from '../../store/slices/foodLogSlice'; // For future use

type FoodLogEntryRouteProp = {
  key: string;
  name: string;
  params: {
    foodLogEntryId: string;
  };
};

type FoodLogEntryNavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

// Helper to display rating as stars, consistent with list screen
const StarRatingDisplay = ({ rating, maxStars = 5 }) => {
  let stars = '';
  for (let i = 0; i < maxStars; i++) {
    stars += i < rating ? '★' : '☆';
  }
  return <Text style={styles.ratingText}>{stars}</Text>;
};

const FoodLogEntryScreen = () => {
  const route = useRoute<FoodLogEntryRouteProp>();
  const navigation = useNavigation<FoodLogEntryNavigationProp>();
  // const dispatch = useDispatch<AppDispatch>(); // For future use

  const { foodLogEntryId } = route.params;
  const entry = useSelector((state: RootState) =>
    state.foodLog.entries.find((e: FoodLogEntry) => e.id === foodLogEntryId)
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Food Log",
      "Are you sure you want to delete this food log entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            // dispatch(deleteFoodLogEntry(foodLogEntryId)).then(() => navigation.goBack()); // Future
            Alert.alert("Placeholder", "Delete functionality to be implemented.");
          },
          style: "destructive"
        },
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert("Placeholder", "Edit functionality to be implemented.");
    // navigation.navigate('EditFoodLog', { foodLogEntryId }); // Future
  };

  if (!entry) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Food log entry not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.mealDescription}>{entry.mealDescription}</Text>
        <Text style={styles.date}>{new Date(entry.date).toLocaleDateString()}</Text>
        <StarRatingDisplay rating={entry.rating} />
      </View>

      {entry.restaurantName && (
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Restaurant:</Text> {entry.restaurantName}</Text>
      )}

      {entry.location?.name && (
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Location:</Text> {entry.location.name}</Text>
      )}

      {entry.photos && entry.photos.length > 0 && (
        <View style={styles.photosContainer}>
          <Text style={styles.photosTitle}>Photos:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {entry.photos.map((photoUrl, index) => (
              <Image key={index} source={{ uri: photoUrl }} style={styles.photo} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Edit Log" onPress={handleEdit} color="#007AFF" />
        <Button title="Delete Log" onPress={handleDelete} color="#FF3B30" />
      </View>
    </ScrollView>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 20, // Add vertical padding
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  mealDescription: {
    fontSize: 26, // Larger for meal description
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 20, // Larger stars
    color: '#FFD700', // Gold
    marginBottom: 10,
  },
  detailText: {
    fontSize: 17,
    color: '#444',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  photosContainer: {
    marginTop: 10, // Add margin top
    marginBottom: 20,
    paddingLeft: 20, // Add left padding for the title
  },
  photosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  photo: {
    width: screenWidth * 0.7, // Adjust photo size
    height: screenWidth * 0.55,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  buttonContainer: {
    marginTop: 30, // More margin for buttons
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});

export default FoodLogEntryScreen;