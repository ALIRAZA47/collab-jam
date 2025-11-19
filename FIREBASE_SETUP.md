# Firebase Setup for Collab Jam

## Prerequisites
- A Firebase account (create one at [firebase.google.com](https://firebase.google.com/))
- A Firebase project

## Setup Instructions

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Firestore Database
1. In your Firebase project, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** or **test mode** (for development)
4. Select a Cloud Firestore location

### 3. Get Firebase Configuration
1. In the Firebase Console, click the gear icon next to "Project Overview"
2. Select **Project settings**
3. Scroll down to "Your apps" section
4. Click the web icon (`</>`) to create a web app
5. Register your app with a nickname (e.g., "Collab Jam")
6. Copy the Firebase configuration object

### 4. Configure Environment Variables
1. In the `/client` directory, create a `.env` file
2. Copy the contents from `.env.sample`
3. Replace the placeholder values with your actual Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Firestore Security Rules (Optional but Recommended)
In the Firebase Console, go to **Firestore Database** → **Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /canvases/{canvasId} {
      allow read, write: if true; // For development
      // For production, implement proper auth rules
    }
  }
}
```

### 6. Restart Your Development Server
After setting up the `.env` file, restart your Vite development server:

```bash
cd client
npm run dev
```

## Features

### Auto-Save
- Canvas automatically saves to Firebase Firestore every 10 seconds
- Changes trigger a debounced save (10 seconds after the last change)

### Manual Save
- **Mac**: Press `Cmd + S`
- **Windows/Linux**: Press `Ctrl + S`

### Data Persistence
- All canvas data is stored in Firebase Firestore under the `canvases` collection
- Each canvas is identified by its room ID
- When users join a room, the canvas data is automatically loaded from Firestore

## Troubleshooting

### Environment variables not working
- Ensure your `.env` file is in the `/client` directory
- Restart the development server after creating/modifying `.env`
- Check that all variables start with `VITE_`

### Firebase connection errors
- Verify your Firebase configuration is correct
- Check that Firestore is enabled in your Firebase project
- Ensure your Firestore security rules allow read/write access

### Canvas not loading
- Check the browser console for errors
- Verify the room ID exists in your Firestore collection
- Ensure your Firebase project is active
