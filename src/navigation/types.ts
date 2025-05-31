import { NavigatorScreenParams } from '@react-navigation/native';
import {
  RootStackParamList as BaseRootStackParamList,
  AuthStackParamList as BaseAuthStackParamList,
  MainTabParamList as BaseMainTabParamList,
  TripStackParamList as BaseTripStackParamList,
  JournalStackParamList as BaseJournalStackParamList,
  FoodLogStackParamList as BaseFoodLogStackParamList,
} from '../types';

export type RootStackParamList = BaseRootStackParamList;

export type MainStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  TripStack: NavigatorScreenParams<TripStackParamList>;
  JournalStack: NavigatorScreenParams<JournalStackParamList>;
  FoodLogStack: NavigatorScreenParams<FoodLogStackParamList>;
};

export type AuthStackParamList = BaseAuthStackParamList & {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = BaseMainTabParamList & {
  Home: undefined;
  Trips: NavigatorScreenParams<TripStackParamList>;
  Journal: NavigatorScreenParams<JournalStackParamList>;
  FoodLog: NavigatorScreenParams<FoodLogStackParamList>;
  Profile: undefined;
};

export type TripStackParamList = BaseTripStackParamList & {
  TripList: undefined;
  TripDetails: { tripId: string };
  CreateTrip: undefined;
  EditTrip: { tripId: string };
  AddActivity: { tripId: string; date: string };
  ActivityDetails: { tripId: string; activityId: string };
};

export type JournalStackParamList = BaseJournalStackParamList & {
  JournalList: undefined;
  JournalEntry: { entryId: string };
  CreateJournalEntry: { tripId: string };
  EditJournalEntry: { entryId: string };
};

export type FoodLogStackParamList = BaseFoodLogStackParamList & {
  FoodLogList: undefined;
  FoodLogEntry: { entryId: string };
  CreateFoodLog: { tripId: string };
  EditFoodLog: { entryId: string };
}; 