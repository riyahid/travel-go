import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FoodLogEntryScreen() {
  return (
    <View style={styles.container}>
      <Text>Food Log Entry Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 