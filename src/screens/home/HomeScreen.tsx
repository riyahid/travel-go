import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchTrips } from '../../store/slices/tripSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import { format } from 'date-fns';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Home'>;

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { trips, loading } = useSelector((state: RootState) => state.trips);
  useEffect(() => {
    if (user && 'id' in user) {
      dispatch(fetchTrips(user.id as never));
    }
  }, [dispatch, user]);

  const upcomingTrips = trips
    .filter(trip => new Date(trip.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const ongoingTrips = trips
    .filter(trip => {
      const now = new Date();
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      return now >= startDate && now <= endDate;
    });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{user?.email}</Text>
      </View>

      {ongoingTrips.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Trip</Text>
          {ongoingTrips.map(trip => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => navigation.navigate('Trips', {
                screen: 'TripDetails',
                params: { tripId: trip.id }
              } as never)}
            >
              <View style={styles.tripHeader}>
                <Icon name="airplane" size={24} color="#0066cc" />
                <Text style={styles.tripTitle}>{trip.title}</Text>
              </View>
              <Text style={styles.tripDates}>
                {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </Text>
              <Text style={styles.destination}>{trip.destination.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Trips</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Trips', { screen: 'TripList' } as never)}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {upcomingTrips.length > 0 ? (
          upcomingTrips.map(trip => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => navigation.navigate('Trips', {
                screen: 'TripDetails',
                params: { tripId: trip.id }
              } as never)}
            >
              <View style={styles.tripHeader}>
                <Icon name="airplane" size={24} color="#0066cc" />
                <Text style={styles.tripTitle}>{trip.title}</Text>
              </View>
              <Text style={styles.tripDates}>
                {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </Text>
              <Text style={styles.destination}>{trip.destination.name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="airplane-off" size={48} color="#6c757d" />
            <Text style={styles.emptyStateText}>No upcoming trips</Text>
            <TouchableOpacity
              style={styles.createTripButton}
              onPress={() => navigation.navigate('Trips', { screen: 'CreateTrip' } as never)}
            >
              <Text style={styles.createTripButtonText}>Plan a Trip</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Journal', { screen: 'CreateJournalEntry' } as never)}
        >
          <Icon name="book-plus" size={24} color="#0066cc" />
          <Text style={styles.actionButtonText}>Add Journal Entry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('FoodLog', { screen: 'CreateFoodLog' } as never)}
        >
          <Icon name="food-fork-drink" size={24} color="#0066cc" />
          <Text style={styles.actionButtonText}>Log Food</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  seeAllText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  tripCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 8,
  },
  tripDates: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  destination: {
    fontSize: 14,
    color: '#495057',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 12,
    marginBottom: 16,
  },
  createTripButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createTripButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    width: '45%',
  },
  actionButtonText: {
    color: '#212529',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
}); 