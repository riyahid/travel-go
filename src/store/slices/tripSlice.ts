import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Trip, Activity } from '../../types';

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;
}

const initialState: TripState = {
  trips: [],
  currentTrip: null,
  loading: false,
  error: null,
};

export const fetchTrips = createAsyncThunk(
  'trips/fetchTrips',
  async () => {
    const querySnapshot = await getDocs(collection(db, 'trips'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Trip[];
  }
);

export const createTrip = createAsyncThunk(
  'trips/createTrip',
  async (tripData: Omit<Trip, 'id'>) => {
    const docRef = await addDoc(collection(db, 'trips'), tripData);
    return { id: docRef.id, ...tripData };
  }
);

export const updateTrip = createAsyncThunk(
  'trips/updateTrip',
  async ({ id, ...tripData }: Trip) => {
    await updateDoc(doc(db, 'trips', id), tripData);
    return { id, ...tripData };
  }
);

export const deleteTrip = createAsyncThunk(
  'trips/deleteTrip',
  async (id: string) => {
    await deleteDoc(doc(db, 'trips', id));
    return id;
  }
);

export const addActivity = createAsyncThunk(
  'trips/addActivity',
  async ({ tripId, activity }: { tripId: string; activity: Omit<Activity, 'id'> }) => {
    const activityRef = collection(db, 'trips', tripId, 'activities');
    
    const activityData = {
      id: activityRef.id,
      ...activity,
    };
    
    await addDoc(activityRef, activityData);
    return { tripId, activity: activityData };
  }
);

const tripSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setCurrentTrip: (state, action) => {
      state.currentTrip = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Trip
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips.push(action.payload);
        state.currentTrip = action.payload;
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create trip';
      })
      // Fetch Trips
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch trips';
      })
      // Update Trip
      .addCase(updateTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.trips.findIndex(trip => trip.id === action.payload.id);
        if (index !== -1) {
          state.trips[index] = action.payload;
          if (state.currentTrip?.id === action.payload.id) {
            state.currentTrip = action.payload;
          }
        }
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update trip';
      })
      // Delete Trip
      .addCase(deleteTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = state.trips.filter(trip => trip.id !== action.payload);
        if (state.currentTrip?.id === action.payload) {
          state.currentTrip = null;
        }
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete trip';
      })
      // Add Activity
      .addCase(addActivity.fulfilled, (state, action) => {
        const { tripId, activity } = action.payload;
        const tripIndex = state.trips.findIndex(trip => trip.id === tripId);
        if (tripIndex !== -1) {
          const trip = state.trips[tripIndex];
          const dayIndex = trip.itinerary.findIndex(
            day => day.date === activity.startTime.split('T')[0]
          );
          if (dayIndex !== -1) {
            state.trips[tripIndex].itinerary[dayIndex].activities.push(activity);
            if (state.currentTrip?.id === tripId) {
              state.currentTrip = state.trips[tripIndex];
            }
          }
        }
      });
  },
});

export const { setCurrentTrip, clearError } = tripSlice.actions;
export default tripSlice.reducer; 