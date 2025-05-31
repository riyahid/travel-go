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
  budget: Budget;
  status: TripStatus;
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
  tripId: string;
  userId: string;
  title: string;
  content: string;
  location?: Location;
  photos: Photo[];
  mood?: string;
  weather?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FoodLog {
  id: string;
  tripId: string;
  userId: string;
  name: string;
  description?: string;
  restaurant?: string;
  location: Location;
  rating: number;
  cost?: number;
  photos: Photo[];
  tags: string[];
  date: string;
  createdAt: string;
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
  entries: FoodLog[];
  currentEntry: FoodLog | null;
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