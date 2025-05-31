import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Button, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../store';
import { fetchJournalEntries } from '../../store/slices/journalSlice';
import { JournalEntry } from '../../types';

type JournalListNavigationProp = {
  navigate: (screen: string, params?: any) => void;
};

const JournalListScreen = () => {
  const navigation = useNavigation<JournalListNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const isFocused = useIsFocused();

  const { user } = useSelector((state: RootState) => state.auth);
  const { entries, loading, error } = useSelector((state: RootState) => state.journal);

  useEffect(() => {
    if (user?.id && isFocused) {
      dispatch(fetchJournalEntries({ userId: user.id }));
    }
  }, [dispatch, user, isFocused]);

  const renderJournalItem = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('JournalEntry', { entryId: item.id })}
    >
      {item.photos && item.photos.length > 0 && (
        <Image source={{ uri: item.photos[0] }} style={styles.thumbnail} />
      )}
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.itemSnippet} numberOfLines={2}>
          {item.text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" color="#0000ff" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error fetching entries: {error}</Text>
        <Button title="Retry" onPress={() => user && dispatch(fetchJournalEntries({ userId: user.id }))} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noEntriesText}>No journal entries yet.</Text>
          <Button
            title="Create New Entry"
            onPress={() => navigation.navigate('CreateJournalEntry')}
          />
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderJournalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
      <View style={styles.createButtonContainer}>
        <Button
          title="Create New Entry"
          onPress={() => navigation.navigate('CreateJournalEntry')}
          color="#007AFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContentContainer: {
    paddingBottom: 80, // Ensure space for the create button
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemSnippet: {
    fontSize: 14,
    color: '#333',
  },
  noEntriesText: {
    fontSize: 18,
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
    // backgroundColor: 'transparent', // Or match screen bg
  },
});

export default JournalListScreen;