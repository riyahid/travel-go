import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: "TravelGo",
  slug: "travel-go",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  splash: {
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.travelgo.app"
  },
  android: {
    package: "com.travelgo.app",
    adaptiveIcon: {
      backgroundColor: "#ffffff"
    }
  },
  plugins: [
    "expo-dev-client",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#ffffff"
      }
    ]
  ],
  extra: {
    firebaseApiKey: process.env.FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.FIREBASE_APP_ID,
    eas: {
      projectId: "your-project-id"
    }
  }
};

export default config; 