import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../store';
import { TripStackParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import Card from '../../components/Card';
import Button from '../../components/Button';

type ActivityDetailsScreenNavigationProp = NativeStackNavigationProp<TripStackParamList, 'ActivityDetails'>;
type ActivityDetailsScreenRouteProp = RouteProp<TripStackParamList, 'ActivityDetails'>;

export default function ActivityDetailsScreen() {
  const navigation = useNavigation<ActivityDetailsScreenNavigationProp>();
  const route = useRoute<ActivityDetailsScreenRouteProp>();
  const { tripId, activityId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const trip = useSelector((state: RootState) =>
    state.trips.trips.find((t) => t.id === tripId)
  );

  const activity = trip?.itinerary
    .flatMap((day) => day.activities)
    .find((a) => a.id === activityId);

  if (!activity) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Activity not found</Text>
      </View>
    );
  }

  const handleEdit = () => {
    // Navigate to edit activity screen (to be implemented)
    Alert.alert('Info', 'Edit activity functionality to be implemented');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Delete activity functionality to be implemented
            Alert.alert('Info', 'Delete activity functionality to be implemented');
          },
        },
      ]
    );
  };

  const getActivityTypeIcon = () => {
    switch (activity.type) {
      case 'sightseeing':
        return 'camera';
      case 'food':
        return 'food-fork-drink';
      case 'transportation':
        return 'train-car';
      case 'accommodation':
        return 'bed';
      case 'entertainment':
        return 'ticket';
      case 'shopping':
        return 'shopping';
      default:
        return 'calendar';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name={getActivityTypeIcon()} size={24} color="#0066cc" />
          <Text style={styles.title}>{activity.title}</Text>
          <TouchableOpacity onPress={handleEdit}>
            <Icon name="pencil" size={24} color="#0066cc" />
          </TouchableOpacity>
        </View>
        <Text style={styles.time}>
          {format(new Date(activity.startTime), 'h:mm a')} -{' '}
          {format(new Date(activity.endTime), 'h:mm a')}
        </Text>
      </View>

      <Card variant="outlined" style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="map-marker" size={24} color="#212529" />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <Text style={styles.locationText}>{activity.location.name}</Text>
        <Text style={styles.addressText}>{activity.location.address}</Text>
      </Card>

      {activity.cost !== undefined && (
        <Card variant="outlined" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="currency-usd" size={24} color="#212529" />
            <Text style={styles.sectionTitle}>Cost</Text>
          </View>
          <Text style={styles.costText}>${activity.cost.toFixed(2)}</Text>
        </Card>
      )}

      {activity.notes && (
        <Card variant="outlined" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="text" size={24} color="#212529" />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Text style={styles.notesText}>{activity.notes}</Text>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          title="Delete Activity"
          onPress={handleDelete}
          variant="danger"
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginHorizontal: 12,
  },
  time: {
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
  locationText: {
    fontSize: 16,
    color: '#212529',
  },
  addressText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  costText: {
    fontSize: 16,
    color: '#212529',
  },
  notesText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 24,
  },
}); 