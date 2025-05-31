import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db, storage } from '../../config/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FoodLog, Photo } from '../../types';

interface FoodLogState {
  entries: FoodLog[];
  currentEntry: FoodLog | null;
  loading: boolean;
  error: string | null;
}

const initialState: FoodLogState = {
  entries: [],
  currentEntry: null,
  loading: false,
  error: null,
};

export const fetchFoodLogs = createAsyncThunk(
  'foodLog/fetchEntries',
  async ({ userId, tripId }: { userId: string; tripId: string }) => {
    const foodLogsRef = collection(db, 'food_logs');
    const q = query(
      foodLogsRef,
      where('tripId', '==', tripId),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FoodLog[];
  }
);

export const createFoodLog = createAsyncThunk(
  'foodLog/createEntry',
  async ({ 
    entry,
    photos
  }: { 
    entry: Omit<FoodLog, 'id' | 'photos' | 'createdAt'>;
    photos: { uri: string; fileName: string }[];
  }) => {
    const now = new Date().toISOString();
    const uploadedPhotos: Photo[] = [];

    // Upload photos to Firebase Storage
    for (const photo of photos) {
      const reference = ref(storage, `food_photos/${photo.fileName}`);
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
    };

    const docRef = await addDoc(collection(db, 'food_logs'), entryData);

    return {
      id: docRef.id,
      ...entryData,
    } as FoodLog;
  }
);

export const updateFoodLog = createAsyncThunk(
  'foodLog/updateEntry',
  async ({ 
    entryId,
    updates,
    newPhotos
  }: { 
    entryId: string;
    updates: Partial<FoodLog>;
    newPhotos?: { uri: string; fileName: string }[];
  }) => {
    let uploadedPhotos: Photo[] = [];

    if (newPhotos && newPhotos.length > 0) {
      const now = new Date().toISOString();
      for (const photo of newPhotos) {
        const reference = ref(storage, `food_photos/${photo.fileName}`);
        const file = await fetch(photo.uri).then(res => res.blob());
        await uploadBytes(reference, file);
        const url = await getDownloadURL(reference);
        
        uploadedPhotos.push({
          id: photo.fileName,
          url,
          takenAt: now,
        });
      }
    }

    const updateData = {
      ...updates,
      ...(uploadedPhotos.length > 0 && {
        photos: [...(updates.photos || []), ...uploadedPhotos],
      }),
    };

    await updateDoc(doc(db, 'food_logs', entryId), updateData);

    return {
      id: entryId,
      ...updateData,
    };
  }
);

export const deleteFoodLog = createAsyncThunk(
  'foodLog/deleteEntry',
  async (entryId: string) => {
    // Get the entry to delete photos
    const entrySnapshot = await getDoc(doc(db, 'food_logs', entryId));
    
    const entry = entrySnapshot.data() as FoodLog;

    // Delete photos from storage
    for (const photo of entry.photos) {
      const reference = ref(storage, `food_photos/${photo.id}`);
      await deleteObject(reference);
    }

    // Delete the entry document
    await deleteDoc(doc(db, 'food_logs', entryId));

    return entryId;
  }
);

const foodLogSlice = createSlice({
  name: 'foodLog',
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
      .addCase(fetchFoodLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoodLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload;
      })
      .addCase(fetchFoodLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch food logs';
      })
      // Create Entry
      .addCase(createFoodLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFoodLog.fulfilled, (state, action) => {
        state.loading = false;
        state.entries.unshift(action.payload);
        state.currentEntry = action.payload;
      })
      .addCase(createFoodLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create food log';
      })
      // Update Entry
      .addCase(updateFoodLog.fulfilled, (state, action) => {
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
      .addCase(deleteFoodLog.fulfilled, (state, action) => {
        state.entries = state.entries.filter(entry => entry.id !== action.payload);
        if (state.currentEntry?.id === action.payload) {
          state.currentEntry = null;
        }
      });
  },
});

export const { setCurrentEntry, clearError } = foodLogSlice.actions;
export default foodLogSlice.reducer;
