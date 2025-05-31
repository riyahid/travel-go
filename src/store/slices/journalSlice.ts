import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, storage } from '../../config/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { JournalEntry } from '../../types';

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
    entryData,
    photos: localPhotoUris, // Array of local image URIs
  }: {
    entryData: Omit<JournalEntry, 'id' | 'photos' | 'createdAt' | 'updatedAt'>;
    localPhotoUris: string[];
  }) => {
    const now = new Date().toISOString();
    const uploadedPhotoUrls: string[] = [];
    const { userId } = entryData; // Assuming userId is part of entryData

    // Generate a new entry ID for photo path (optional, or upload after creation)
    // For simplicity, we'll use a placeholder or a simpler path for now.
    // A more robust solution might involve creating the doc, then uploading, then updating.
    const tempEntryId = doc(collection(db, 'temp')).id; // Firestore generates IDs this way

    // Upload photos to Firebase Storage
    for (let i = 0; i < localPhotoUris.length; i++) {
      const localUri = localPhotoUris[i];
      const fileName = `photo_${Date.now()}_${i}.jpg`; // Create a unique filename
      // Path: journals/{userId}/{entryId}/{filename}
      // For now, entryId might not be available before creation.
      // Using a temporary path or simplifying for now.
      const photoRef = ref(storage, `journals/${userId}/${tempEntryId}/${fileName}`);
      
      const response = await fetch(localUri);
      const blob = await response.blob();

      await uploadBytes(photoRef, blob);
      const downloadURL = await getDownloadURL(photoRef);
      uploadedPhotoUrls.push(downloadURL);
    }

    const finalEntryData = {
      ...entryData,
      photos: uploadedPhotoUrls,
      createdAt: now,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, 'journal_entries'), finalEntryData);

    return {
      id: docRef.id,
      ...finalEntryData,
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
    newPhotosUris?: string[]; // Array of new local image URIs
    existingPhotos?: string[]; // Array of existing photo URLs to keep
  }) => {
    const updatedAt = new Date().toISOString();
    const newUploadedPhotoUrls: string[] = [];
    const { userId } = updates; // Assuming userId will be part of updates or fetched from current entry

    // This part needs careful handling of existing photos, deleting removed ones, and uploading new ones.
    // For this subtask, the focus is on createJournalEntry. We'll simplify update for now.
    // A real implementation would:
    // 1. Identify photos to delete from storage.
    // 2. Upload new photos.
    // 3. Combine existing kept photos with new URLs.

    if (newPhotosUris && newPhotosUris.length > 0 && userId) {
      for (let i = 0; i < newPhotosUris.length; i++) {
        const localUri = newPhotosUris[i];
        const fileName = `photo_${Date.now()}_${i}.jpg`;
        const photoRef = ref(storage, `journals/${userId}/${entryId}/${fileName}`);
        
        const response = await fetch(localUri);
        const blob = await response.blob();

        await uploadBytes(photoRef, blob);
        const downloadURL = await getDownloadURL(photoRef);
        newUploadedPhotoUrls.push(downloadURL);
      }
    }

    const finalPhotos = [...(existingPhotos || []), ...newUploadedPhotoUrls];

    const updateData: Partial<JournalEntry> = {
      ...updates,
      photos: finalPhotos,
      updatedAt,
    };

    // Remove undefined fields from updateData to avoid overwriting with undefined in Firestore
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);


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
    const entryRef = doc(db, 'journal_entries', entryId);
    const entrySnapshot = await getDoc(entryRef);
    const entryData = entrySnapshot.data() as JournalEntry | undefined;

    if (entryData?.photos && entryData.photos.length > 0) {
      // Delete photos from Firebase Storage
      for (const photoUrl of entryData.photos) {
        try {
          const photoRef = ref(storage, photoUrl); // Construct ref from URL
          await deleteObject(photoRef);
        } catch (error) {
          // Log error if a photo delete fails, but continue
          console.error("Failed to delete photo from storage:", photoUrl, error);
        }
      }
    }

    // Delete the entry document from Firestore
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