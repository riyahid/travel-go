import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';

export default function TripListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TravelGo!</Text>
      <Text style={styles.subtitle}>Your travel companion</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Create Trip"
          onPress={() => {}}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    width: '100%',
  },
}); 