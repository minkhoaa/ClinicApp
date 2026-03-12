# ClinicApp

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-black?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-black?style=for-the-badge&logo=typescript)
![Expo](https://img.shields.io/badge/Expo-black?style=for-the-badge&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-black?style=for-the-badge&logo=react)

A cross-platform mobile application for clinic appointment management, built with Expo and React Native. Patients can register, book appointments, view medical history, and manage their health profile — all from a single app on iOS and Android.

---

## Features

- **Authentication** — Secure JWT-based login and registration with token persistence via Expo SecureStore
- **Appointment Booking** — Browse available clinic services and time slots, then book appointments with real-time status tracking (pending, confirmed, completed, cancelled, no-show)
- **Medical History** — Access full medical records including diagnoses, treatment notes, prescriptions, and file attachments
- **Patient Profile** — Manage personal details, emergency contacts, blood group, insurance information, and allergy/chronic disease records
- **Appointment Management** — Cancel upcoming appointments and submit star ratings with written reviews after completed visits
- **Dark / Light Mode** — Automatic system-level theme support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54, React Native 0.81 |
| Language | TypeScript 5.9 |
| Navigation | Expo Router (file-based), React Navigation (Drawer + Bottom Tabs) |
| HTTP Client | Axios with request/response interceptors |
| Storage | Expo SecureStore (tokens), AsyncStorage (general) |
| UI | Custom components, Expo Vector Icons |
| Animation | React Native Reanimated 4, Gesture Handler |

---

## Project Structure

```
app/
  (auth)/          # Login screen and auth layout
  (patient)/       # Patient drawer: dashboard, appointments, history, profile
  booking.tsx      # Appointment booking flow
  index.tsx        # Entry redirect
services/
  api.ts           # Axios instance with auth interceptors
  apiPatient.ts    # Patient-specific API calls (appointments, records, profile)
  auth.ts          # Authentication API calls
  storage.ts       # Token storage helpers
context/
  AuthContext.tsx  # Global auth state and user session
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator, or a physical device with the Expo Go app

### Installation

```bash
git clone https://github.com/minkhoaa/ClinicApp.git
cd ClinicApp
npm install
```

### Configure Backend URL

Open `services/api.ts` and update `BACKEND_URL` to point to your backend server:

```ts
// Android Emulator:  http://10.0.2.2:5000
// iOS Simulator:     http://localhost:5000
// Physical device:   http://<your-local-ip>:5000
const BACKEND_URL = 'http://192.168.1.24:5000';
```

### Run

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in browser
npm run web
```

---

## License

This project is for educational and personal use.
