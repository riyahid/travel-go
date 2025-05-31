import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Button, Alert, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../store';
import { JournalEntry } from '../../types';
// import { deleteJournalEntry } from '../../store/slices/journalSlice'; // For future use

type JournalEntryRouteProp = {
  key: string;
  name: string;
  params: {
    entryId: string;
  };
};

type JournalEntryNavigationProp = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
};

const JournalEntryScreen = () => {
  const route = useRoute<JournalEntryRouteProp>();
  const navigation = useNavigation<JournalEntryNavigationProp>();
  // const dispatch = useDispatch<AppDispatch>(); // For future use with delete/edit

  const { entryId } = route.params;
  const entry = useSelector((state: RootState) =>
    state.journal.entries.find((e: JournalEntry) => e.id === entryId)
  );

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            // dispatch(deleteJournalEntry(entryId)).then(() => navigation.goBack()); // Future
            Alert.alert("Placeholder", "Delete functionality to be implemented.");
            // navigation.goBack();
          },
          style: "destructive"
        },
      ]
    );
  };

  const handleEdit = () => {
    Alert.alert("Placeholder", "Edit functionality to be implemented.");
    // navigation.navigate('EditJournalEntry', { entryId }); // Future
  };

  if (!entry) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Journal entry not found.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.date}>{new Date(entry.date).toLocaleDateString()}</Text>
      </View>

      {entry.location && (
        <Text style={styles.location}>Location: {entry.location.name}</Text>
      )}

      <Text style={styles.text}>{entry.text}</Text>

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
        <Button title="Edit Entry" onPress={handleEdit} color="#007AFF" />
        <Button title="Delete Entry" onPress={handleDelete} color="#FF3B30" />
      </View>
    </ScrollView>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 15,
  },
  text: {
    fontSize: 18,
    lineHeight: 26,
    color: '#444',
    marginBottom: 20,
  },
  photosContainer: {
    marginBottom: 20,
  },
  photosTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  photo: {
    width: screenWidth * 0.8, // Make photos large
    height: screenWidth * 0.6,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#eee', // Placeholder bg
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default JournalEntryScreen;