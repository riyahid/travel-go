import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function EditJournalEntryScreen() {
  return (
    <View style={styles.container}>
      <Text>Edit Journal Entry Screen</Text>
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