export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  travelStyle: TravelStyle[];
  interests: string[];
  budget: BudgetLevel;
  preferredActivities: string[];
}

export type TravelStyle = 'solo' | 'family' | 'couple' | 'group';
export type BudgetLevel = 'budget' | 'moderate' | 'luxury';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
}

export interface Destination extends Location {
  country: string;
}

export type ActivityType = 'sightseeing' | 'food' | 'transportation' | 'accommodation' | 'entertainment' | 'shopping' | 'other';
export type ActivityStatus = 'planned' | 'completed' | 'cancelled';

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  startTime: string;
  endTime: string;
  location: Location;
  cost?: number;
  notes?: string;
  status: ActivityStatus;
}

export type TripStatus = 'planning' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface ItineraryDay {
  date: string;
  activities: Activity[];
}

export interface BudgetCategory {
  name: string;
  limit: number;
  spent: number;
}

export interface Budget {
  total: number;
  spent: number;
  currency: string;
  categories: Record<string, BudgetCategory>;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  destination: Destination;
  itinerary: ItineraryDay[];
  budget: Budget; // For actual spending
  status: TripStatus;
  preferences?: {
    travelStyle?: string; // e.g., 'Solo', 'Couple', 'Family', 'Backpacking', 'Luxury'
    interests?: string[]; // e.g., ['Adventure', 'Culture', 'Relaxation', 'Foodie']
    budgetEstimate?: {
      amount?: number;
      currency?: string; // e.g., 'USD', 'EUR'
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  url: string;
  takenAt: string;
}

export interface JournalEntry {
  id: string;
  tripId: string; // To associate with a trip
  userId: string;
  date: string; // ISO date string
  title: string;
  text: string;
  photos?: string[]; // Array of photo URLs (from Firebase Storage)
  location?: {
    name: string; // Manual input for now
    latitude?: number;
    longitude?: number;
  };
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface FoodLogEntry {
  id: string;
  tripId?: string; // Optional: to associate with a trip
  userId: string;
  date: string; // ISO date string
  mealDescription: string;
  rating: number; // e.g., 1-5 stars
  photos?: string[]; // Array of photo URLs (from Firebase Storage)
  restaurantName?: string;
  location?: { // Optional: for more precise location
    name: string;
    latitude?: number;
    longitude?: number;
  };
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;
}

export interface JournalState {
  entries: JournalEntry[];
  currentEntry: JournalEntry | null;
  loading: boolean;
  error: string | null;
}

export interface FoodLogState {
  entries: FoodLogEntry[];
  currentEntry: FoodLogEntry | null;
  loading: boolean;
  error: string | null;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Trips: undefined;
  Journal: undefined;
  FoodLog: undefined;
  Profile: undefined;
};

export type TripStackParamList = {
  TripList: undefined;
  TripDetails: { tripId: string };
  CreateTrip: undefined;
  EditTrip: { tripId: string };
  AddActivity: { tripId: string; date: string };
  ActivityDetails: { tripId: string; activityId: string };
};

export type JournalStackParamList = {
  JournalList: undefined;
  JournalEntry: { entryId: string };
  CreateEntry: { tripId: string };
  EditEntry: { entryId: string };
};

export type FoodLogStackParamList = {
  FoodLogList: undefined;
  FoodLogEntry: { entryId: string };
  CreateFoodLog: { tripId: string };
  EditFoodLog: { entryId: string };
};

export interface Recommendation {
  id: string;
  type: 'attraction' | 'restaurant' | 'event' | 'accommodation';
  title: string;
  description: string;
  location: Location;
  rating: number;
  price?: {
    amount: number;
    currency: string;
  };
  openingHours?: {
    [key: string]: string;
  };
  photos: string[];
  tags: string[];
  source: string;
} 