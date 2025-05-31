import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function JournalListScreen() {
  return (
    <View style={styles.container}>
      <Text>Journal List Screen</Text>
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