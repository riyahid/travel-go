import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, storage } from '../../config/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { JournalEntry, Photo } from '../../types';

interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  loading: boolean;
  error: string | null;
}

const initialState: JournalState = {
  entries: [],
  currentEntry: null,
  loading: false,
  error: null,
};

export const fetchJournalEntries = createAsyncThunk(
  'journal/fetchEntries',
  async ({ userId, tripId }: { userId: string; tripId?: string }) => {
    const journalRef = collection(db, 'journal_entries');
    let q = query(journalRef, where('userId', '==', userId));

    if (tripId) {
      q = query(q, where('tripId', '==', tripId));
    }

    q = query(q, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JournalEntry[];
  }
);

export const createJournalEntry = createAsyncThunk(
  'journal/createEntry',
  async ({ 
    entry,
    photos
  }: { 
    entry: Omit<JournalEntry, 'id' | 'photos' | 'createdAt' | 'updatedAt'>;
    photos: { uri: string; fileName: string }[];
  }) => {
    const now = new Date().toISOString();
    const uploadedPhotos: Photo[] = [];

    // Upload photos to Firebase Storage
    for (const photo of photos) {
      const reference = ref(storage, `journal_photos/${photo.fileName}`);
      const file = await fetch(photo.uri).then(res => res.blob());
      await uploadBytes(reference, file);
      const url = await getDownloadURL(reference);
      
      uploadedPhotos.push({
        id: photo.fileName,
        url,
        takenAt: now,
      });
    }

    const entryData = {
      ...entry,
      photos: uploadedPhotos,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'journal_entries'), entryData);

    return {
      id: docRef.id,
      ...entryData,
    } as JournalEntry;
  }
);

export const updateJournalEntry = createAsyncThunk(
  'journal/updateEntry',
  async ({ 
    entryId,
    updates,
    newPhotos
  }: { 
    entryId: string;
    updates: Partial<JournalEntry>;
    newPhotos?: { uri: string; fileName: string }[];
  }) => {
    const updatedAt = new Date().toISOString();
    let uploadedPhotos: Photo[] = [];

    if (newPhotos && newPhotos.length > 0) {
      // Upload new photos
      for (const photo of newPhotos) {
        const reference = ref(storage, `journal_photos/${photo.fileName}`);
        const file = await fetch(photo.uri).then(res => res.blob());
        await uploadBytes(reference, file);
        const url = await getDownloadURL(reference);
        
        uploadedPhotos.push({
          id: photo.fileName,
          url,
          takenAt: updatedAt,
        });
      }
    }

    const updateData = {
      ...updates,
      updatedAt,
      ...(uploadedPhotos.length > 0 && {
        photos: [...(updates.photos || []), ...uploadedPhotos],
      }),
    };

    await updateDoc(doc(db, 'journal_entries', entryId), updateData);

    return {
      id: entryId,
      ...updateData,
    };
  }
);

export const deleteJournalEntry = createAsyncThunk(
  'journal/deleteEntry',
  async (entryId: string) => {
    // Get the entry to delete photos
    const entrySnapshot = await getDoc(doc(db, 'journal_entries', entryId));
    
    const entry = entrySnapshot.data() as JournalEntry;

    // Delete photos from storage
    for (const photo of entry.photos) {
      const reference = ref(storage, `journal_photos/${photo.id}`);
      await deleteObject(reference);
    }

    // Delete the entry document
    await deleteDoc(doc(db, 'journal_entries', entryId));

    return entryId;
  }
);

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    setCurrentEntry: (state, action) => {
      state.currentEntry = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Entries
      .addCase(fetchJournalEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch journal entries';
      })
      // Create Entry
      .addCase(createJournalEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJournalEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries.unshift(action.payload);
        state.currentEntry = action.payload;
      })
      .addCase(createJournalEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create journal entry';
      })
      // Update Entry
      .addCase(updateJournalEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = {
            ...state.entries[index],
            ...action.payload,
          };
          if (state.currentEntry?.id === action.payload.id) {
            state.currentEntry = state.entries[index];
          }
        }
      })
      // Delete Entry
      .addCase(deleteJournalEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(entry => entry.id !== action.payload);
        if (state.currentEntry?.id === action.payload) {
          state.currentEntry = null;
        }
      });
  },
});

export const { setCurrentEntry, clearError } = journalSlice.actions;
export default journalSlice.reducer; 