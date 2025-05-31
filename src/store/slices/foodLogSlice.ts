import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, storage } from '../../config/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FoodLogEntry } from '../../types'; // Updated type

interface FoodLogState {
  entries: FoodLogEntry[]; // Updated type
  currentEntry: FoodLogEntry | null; // Updated type
  loading: boolean;
  error: string | null;
}

const initialState: FoodLogState = {
  entries: [],
  currentEntry: null,
  loading: false,
  error: null,
};

// Renamed thunk and updated params
export const fetchFoodLogEntries = createAsyncThunk(
  'foodLog/fetchEntries',
  async ({ userId, tripId }: { userId: string; tripId?: string }) => {
    const foodLogRef = collection(db, 'food_logs'); // Collection name
    let q = query(foodLogRef, where('userId', '==', userId));

    if (tripId) {
      q = query(q, where('tripId', '==', tripId));
    }

    q = query(q, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FoodLogEntry[]; // Updated type
  }
);

// Renamed thunk and updated params/logic
export const createFoodLogEntry = createAsyncThunk(
  'foodLog/createEntry',
  async ({
    entryData,
    localPhotoUris,
  }: {
    entryData: Omit<FoodLogEntry, 'id' | 'photos' | 'createdAt' | 'updatedAt'>;
    localPhotoUris: string[];
  }) => {
    const now = new Date().toISOString();
    const uploadedPhotoUrls: string[] = [];
    const { userId } = entryData;

    // Using a temporary ID for photo path construction before actual entry ID is known
    const tempEntryId = doc(collection(db, 'temp')).id;

    for (let i = 0; i < localPhotoUris.length; i++) {
      const localUri = localPhotoUris[i];
      const fileName = `photo_${Date.now()}_${i}.jpg`;
      // Updated path: foodlogs/{userId}/{entryId}/{filename}
      const photoRef = ref(storage, `foodlogs/${userId}/${tempEntryId}/${fileName}`);
      
      const response = await fetch(localUri);
      const blob = await response.blob();

      await uploadBytes(photoRef, blob);
      const downloadURL = await getDownloadURL(photoRef);
      uploadedPhotoUrls.push(downloadURL);
    }

    const finalEntryData: FoodLogEntry = {
      ...entryData,
      id: '', // Will be overwritten by Firestore ID, but satisfy type
      photos: uploadedPhotoUrls,
      createdAt: now,
      updatedAt: now, // Added updatedAt
    };

    // Remove id before sending to Firestore, Firestore will generate it.
    const { id, ...dataToSave } = finalEntryData;

    const docRef = await addDoc(collection(db, 'food_logs'), dataToSave);

    return {
      ...finalEntryData,
      id: docRef.id, // Add the actual ID back
    } as FoodLogEntry; // Updated type
  }
);

// Renamed thunk and updated params/logic
export const updateFoodLogEntry = createAsyncThunk(
  'foodLog/updateEntry',
  async ({
    entryId,
    updates,
    newLocalPhotoUris,
    existingPhotoUrls = [], // URLs of photos to keep
  }: {
    entryId: string;
    updates: Partial<Omit<FoodLogEntry, 'id' | 'createdAt' | 'updatedAt'>>; // Exclude these from direct update
    newLocalPhotoUris?: string[];
    existingPhotoUrls?: string[];
  }) => {
    const now = new Date().toISOString();
    const newUploadedPhotoUrls: string[] = [];

    // Fetch userId from the existing entry or ensure it's in updates if needed for path
    // For simplicity, assume updates.userId or fetch the document first if needed for path construction.
    // This example assumes userId might be part of `updates` if path construction needs it,
    // or that photos are uploaded to a path not requiring entryId for updates.
    // For now, we'll use entryId in the path, assuming userId is available.

    let userIdForPath = updates.userId;
    if (!userIdForPath) {
        const docSnap = await getDoc(doc(db, 'food_logs', entryId));
        if (docSnap.exists()) {
            userIdForPath = (docSnap.data() as FoodLogEntry).userId;
        } else {
            throw new Error("Original document not found for update, cannot determine user ID for photo path.");
        }
    }


    if (newLocalPhotoUris && newLocalPhotoUris.length > 0 && userIdForPath) {
      for (let i = 0; i < newLocalPhotoUris.length; i++) {
        const localUri = newLocalPhotoUris[i];
        const fileName = `update_photo_${Date.now()}_${i}.jpg`;
        const photoRef = ref(storage, `foodlogs/${userIdForPath}/${entryId}/${fileName}`);
        
        const response = await fetch(localUri);
        const blob = await response.blob();
        await uploadBytes(photoRef, blob);
        const downloadURL = await getDownloadURL(photoRef);
        newUploadedPhotoUrls.push(downloadURL);
      }
    }

    // Here, you'd also handle deletion of photos from storage if they were removed from existingPhotoUrls
    // This part is complex and omitted for brevity, similar to journalSlice.

    const finalPhotos = [...existingPhotoUrls, ...newUploadedPhotoUrls];

    const dataToUpdate: Partial<FoodLogEntry> = {
      ...updates,
      photos: finalPhotos,
      updatedAt: now, // Added updatedAt
    };

    await updateDoc(doc(db, 'food_logs', entryId), dataToUpdate);

    // Fetch the updated document to return the full entry
    const updatedDoc = await getDoc(doc(db, 'food_logs', entryId));
    return { id: updatedDoc.id, ...updatedDoc.data() } as FoodLogEntry;
  }
);

// Renamed thunk and updated logic
export const deleteFoodLogEntry = createAsyncThunk(
  'foodLog/deleteEntry',
  async (entryId: string) => {
    const entryRef = doc(db, 'food_logs', entryId);
    const entrySnapshot = await getDoc(entryRef);
    const entryData = entrySnapshot.data() as FoodLogEntry | undefined;

    if (entryData?.photos && entryData.photos.length > 0) {
      for (const photoUrl of entryData.photos) {
        try {
          const photoRef = ref(storage, photoUrl);
          await deleteObject(photoRef);
        } catch (error) {
          console.error("Failed to delete photo from storage:", photoUrl, error);
        }
      }
    }

    await deleteDoc(entryRef);
    return entryId;
  }
);

const foodLogSlice = createSlice({
  name: 'foodLog', // Name remains the same
  initialState,
  reducers: {
    setCurrentFoodLogEntry: (state, action) => { // Renamed reducer
      state.currentEntry = action.payload;
    },
    clearFoodLogError: (state) => { // Renamed reducer
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Entries
      .addCase(fetchFoodLogEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoodLogEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchFoodLogEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch food log entries';
      })
      // Create Entry
      .addCase(createFoodLogEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFoodLogEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.entries.unshift(action.payload); // Add to the beginning of the list
        state.currentEntry = action.payload;
      })
      .addCase(createFoodLogEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create food log entry';
      })
      // Update Entry
      .addCase(updateFoodLogEntry.fulfilled, (state, action) => {
        const index = state.entries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload; // Replace the whole entry
          if (state.currentEntry?.id === action.payload.id) {
            state.currentEntry = action.payload;
          }
        }
      })
      .addCase(updateFoodLogEntry.rejected, (state, action) => {
        // Handle rejected case if needed, e.g., set an error
        state.loading = false;
        state.error = action.error.message || 'Failed to update food log entry';
      })
      // Delete Entry
      .addCase(deleteFoodLogEntry.fulfilled, (state, action) => {
        state.entries = state.entries.filter(entry => entry.id !== action.payload);
        if (state.currentEntry?.id === action.payload) {
          state.currentEntry = null;
        }
      })
      .addCase(deleteFoodLogEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete food log entry';
      });
  },
});

export const { setCurrentFoodLogEntry, clearFoodLogError } = foodLogSlice.actions; // Renamed actions
export default foodLogSlice.reducer;
