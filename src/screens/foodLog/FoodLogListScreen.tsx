import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Button, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store';
import { fetchFoodLogEntries } from '../../store/slices/foodLogSlice';
import { FoodLogEntry } from '../../types';

type FoodLogListNavigationProp = {
  navigate: (screen: string, params?: any) => void;
};

// Helper to display rating as stars
const StarRatingDisplay = ({ rating, maxStars = 5 }) => {
  let stars = '';
  for (let i = 0; i < maxStars; i++) {
    stars += i < rating ? '★' : '☆';
  }
  return <Text style={styles.itemRating}>{stars}</Text>;
};


const FoodLogListScreen = () => {
  const navigation = useNavigation<FoodLogListNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const isFocused = useIsFocused();

  const { user } = useSelector((state: RootState) => state.auth);
  const { entries, loading, error } = useSelector((state: RootState) => state.foodLog);

  useEffect(() => {
    if (user?.id && isFocused) {
      // Assuming fetching all for the user, not trip-specific on this screen
      dispatch(fetchFoodLogEntries({ userId: user.id }));
    }
  }, [dispatch, user, isFocused]);

  const renderFoodLogItem = ({ item }: { item: FoodLogEntry }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('FoodLogEntry', { foodLogEntryId: item.id })}
    >
      {item.photos && item.photos.length > 0 && (
        <Image source={{ uri: item.photos[0] }} style={styles.thumbnail} />
      )}
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemMealDescription} numberOfLines={2}>{item.mealDescription}</Text>
        <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <StarRatingDisplay rating={item.rating} />
        {item.restaurantName && <Text style={styles.itemRestaurant} numberOfLines={1}>@{item.restaurantName}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" color="#0066cc" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error fetching food logs: {error}</Text>
        <Button title="Retry" onPress={() => user && dispatch(fetchFoodLogEntries({ userId: user.id }))} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noEntriesText}>No food logs yet.</Text>
          <Button
            title="Log New Meal"
            onPress={() => navigation.navigate('CreateFoodLog')}
          />
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderFoodLogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
      <View style={styles.createButtonContainer}>
        <Button
          title="Log New Meal"
          onPress={() => navigation.navigate('CreateFoodLog')}
          color="#007AFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light gray background
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContentContainer: {
    paddingBottom: 80, // Space for the create button
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // Softer shadow
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnail: {
    width: 70, // Slightly larger thumbnail
    height: 70,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#e0e0e0', // Placeholder color
  },
  itemTextContainer: {
    flex: 1,
  },
  itemMealDescription: {
    fontSize: 17, // Slightly larger font
    fontWeight: '500', // Medium weight
    marginBottom: 5,
  },
  itemDate: {
    fontSize: 13,
    color: '#555', // Darker gray for date
    marginBottom: 4,
  },
  itemRating: {
    fontSize: 15,
    color: '#FFD700', // Gold for stars
    marginBottom: 4,
  },
  itemRestaurant: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
  },
  noEntriesText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  createButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingVertical: 10,
  },
});

export default FoodLogListScreen;