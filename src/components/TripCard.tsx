import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { Trip } from '../types';
import Card from './Card';

interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
}

export default function TripCard({ trip, onPress }: TripCardProps) {
  const isUpcoming = new Date(trip.startDate) > new Date();
  const isOngoing = () => {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    return now >= startDate && now <= endDate;
  };

  const getStatusColor = () => {
    if (isOngoing()) return '#28a745'; // Green for ongoing
    if (isUpcoming) return '#0066cc'; // Blue for upcoming
    return '#6c757d'; // Gray for past trips
  };

  return (
    <Card onPress={onPress} variant="elevated">
      <View style={styles.container}>
        <View style={styles.header}>
          <Icon name="airplane" size={24} color={getStatusColor()} />
          <Text style={styles.title}>{trip.title}</Text>
        </View>
        
        <Text style={styles.dates}>
          {format(new Date(trip.startDate), 'MMM d')} -{' '}
          {format(new Date(trip.endDate), 'MMM d, yyyy')}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.location}>
            <Icon name="map-marker" size={16} color="#6c757d" />
            <Text style={styles.destination}>{trip.destination.name}</Text>
          </View>
          
          <View style={[styles.status, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {isOngoing() ? 'Ongoing' : isUpcoming ? 'Upcoming' : 'Past'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 8,
    flex: 1,
  },
  dates: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destination: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 4,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 