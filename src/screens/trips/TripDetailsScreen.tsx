import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootState } from '../../store';
import { TripStackParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import Card from '../../components/Card';
import Button from '../../components/Button';

type TripDetailsScreenNavigationProp = NativeStackNavigationProp<TripStackParamList, 'TripDetails'>;
type TripDetailsScreenRouteProp = RouteProp<TripStackParamList, 'TripDetails'>;

export default function TripDetailsScreen() {
  const navigation = useNavigation<TripDetailsScreenNavigationProp>();
  const route = useRoute<TripDetailsScreenRouteProp>();
  const { tripId } = route.params;

  const trip = useSelector((state: RootState) =>
    state.trips.trips.find((t) => t.id === tripId)
  );

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  const handleEditTrip = () => {
    navigation.navigate('EditTrip', { tripId });
  };

  const handleAddActivity = () => {
    navigation.navigate('AddActivity', { tripId, date: trip.startDate });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{trip.title}</Text>
          <TouchableOpacity onPress={handleEditTrip}>
            <Icon name="pencil" size={24} color="#0066cc" />
          </TouchableOpacity>
        </View>
        <Text style={styles.dates}>
          {format(new Date(trip.startDate), 'MMM d')} -{' '}
          {format(new Date(trip.endDate), 'MMM d, yyyy')}
        </Text>
      </View>

      <Card variant="outlined" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="map-marker" size={24} color="#212529" />
          <Text style={styles.sectionTitle}>Destination</Text>
        </View>
        <Text style={styles.destinationText}>
          {trip.destination.name}, {trip.destination.country}
        </Text>
      </Card>

      {trip.description && (
        <Card variant="outlined" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="text" size={24} color="#212529" />
            <Text style={styles.sectionTitle}>Description</Text>
          </View>
          <Text style={styles.descriptionText}>{trip.description}</Text>
        </Card>
      )}

      <Card variant="outlined" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="calendar" size={24} color="#212529" />
          <Text style={styles.sectionTitle}>Itinerary</Text>
        </View>
        {trip.itinerary.length > 0 ? (
          trip.itinerary.map((day, index) => (
            <View key={day.date} style={styles.dayContainer}>
              <Text style={styles.dayText}>
                Day {index + 1} - {format(new Date(day.date), 'MMM d, yyyy')}
              </Text>
              {day.activities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activity}
                  onPress={() =>
                    navigation.navigate('ActivityDetails', {
                      tripId,
                      activityId: activity.id,
                    })
                  }
                >
                  <Icon name="clock" size={16} color="#6c757d" />
                  <Text style={styles.activityTime}>
                    {format(new Date(activity.startTime), 'HH:mm')}
                  </Text>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No activities planned yet</Text>
        )}
      </Card>

      <View style={styles.actions}>
        <Button
          title="Add Activity"
          onPress={handleAddActivity}
          style={styles.addButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  dates: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 8,
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 8,
  },
  destinationText: {
    fontSize: 16,
    color: '#495057',
  },
  descriptionText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  dayContainer: {
    marginBottom: 16,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  activityTime: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 14,
    color: '#212529',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  addButton: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 24,
  },
}); 