# Firebase Setup Guide

This guide will help you set up Firebase Authentication and Firestore for the Sportify application.

## Prerequisites

- A Firebase account ([Sign up here](https://console.firebase.google.com/))
- A Firebase project created

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Set up Firestore Database

1. In your Firebase project, go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **Production mode** (for production)
4. Select a location for your database (choose the closest to your users)
5. Click **Enable**

### Firestore Security Rules

For production, update your Firestore security rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Assessments collection - users can only read/write their own data
    match /assessments/{assessmentId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Step 4: Get Your Firebase Configuration

1. In your Firebase project, click the **Settings (gear icon)** → **Project settings**
2. Scroll down to **Your apps** section
3. Click the **Web icon** (`</>`) to add a web app (if not already added)
4. Register your app with a nickname (e.g., "Sportify Web")
5. Copy the Firebase configuration object

## Step 5: Configure Environment Variables

1. Create a `.env` file in the root directory of the project
2. Copy the contents from `.env.example`
3. Fill in your Firebase configuration values:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789
```

**Important:** Never commit your `.env` file to version control. It's already in `.gitignore`.

## Step 6: Install Dependencies

The Firebase package is already included in `package.json`. If you haven't installed it yet:

```bash
npm install
```

## Step 7: Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the browser console and look for:
   - "Firebase initialized successfully" - Firebase is configured correctly
   - "Firebase configuration not provided" - Check your `.env` file

3. Try signing up a new user:
   - Navigate to the app
   - Click "Sign Up" in the navigation
   - Create a test account

4. Check Firebase Console:
   - Go to **Authentication** → **Users** - You should see your test user
   - Go to **Firestore Database** → **Data** - After running an assessment, you should see an `assessments` collection

## Features Enabled with Firebase

Once Firebase is configured, the following features become available:

### ✅ User Authentication
- Email/password sign up
- Email/password sign in
- User session persistence
- Secure logout

### ✅ Assessment History
- Save assessment reports to Firestore
- View past assessments in the History page
- Reports tagged with user ID for privacy

### ✅ Data Persistence
- Primary storage in Firestore (cloud)
- IndexedDB still used for offline caching
- Automatic sync when online

## Troubleshooting

### "Firebase configuration not provided"
- Check that your `.env` file exists in the root directory
- Verify all environment variables are set correctly
- Restart the development server after creating/modifying `.env`

### "Permission denied" errors in Firestore
- Check your Firestore security rules
- Ensure authentication is enabled
- Verify the user is logged in

### Authentication not working
- Verify Email/Password authentication is enabled in Firebase Console
- Check browser console for specific error messages
- Ensure your Firebase project has Authentication enabled

### Reports not saving
- Check Firestore security rules allow writes
- Verify user is authenticated (check if History link appears in navbar)
- Check browser console for error messages

## Production Deployment

For production deployment:

1. Update Firestore security rules to production mode
2. Set up proper CORS rules if needed
3. Add your production domain to Firebase authorized domains (Authentication → Settings → Authorized domains)
4. Consider enabling additional security features:
   - Email verification
   - Password strength requirements
   - Rate limiting

## Support

For Firebase-specific issues, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)

