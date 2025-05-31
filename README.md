# TravelGo - Travel Itinerary & Journal App

A comprehensive travel companion app that helps users plan their trips, manage itineraries, and document their travel experiences.

## Features

- 📍 Personalized trip planning and itinerary generation
- 🗺️ Real-time navigation and route updates
- 🎫 Ticket and reservation management
- 📝 Travel journal with photo integration
- 🍽️ Food and drink logging
- 🎯 Local recommendations and attractions
- 📱 Social media sharing and blog export

## Tech Stack

- React Native
- TypeScript
- Redux Toolkit for state management
- Firebase for backend services
- Google Maps API for navigation
- Various third-party integrations (Skyscanner, Booking.com, etc.)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- React Native development environment setup
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travel-go.git
cd travel-go
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install iOS dependencies (macOS only):
```bash
cd ios && pod install && cd ..
```

4. Create a `.env` file in the root directory and add your API keys:
```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FIREBASE_API_KEY=your_firebase_api_key
```

5. Start the development server:
```bash
npm start
# or
yarn start
```

6. Run the app:
```bash
# For iOS
npm run ios
# or
yarn ios

# For Android
npm run android
# or
yarn android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/      # API and third-party service integrations
├── store/         # Redux store and slices
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── assets/        # Images, fonts, and other static assets
├── types/         # TypeScript type definitions
└── config/        # App configuration files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Maps API
- Firebase
- React Native community
- All third-party service providers 