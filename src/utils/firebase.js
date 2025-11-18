/**
 * firebase.js
 * Firebase initialization and API utilities
 * Handles Authentication and Firestore services
 */

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
// Read environment variables with fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Debug logging to verify environment variables are loaded
console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  apiKeyLength: firebaseConfig.apiKey?.length || 0,
  apiKeyPreview: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
  hasProjectId: !!firebaseConfig.projectId,
  projectId: firebaseConfig.projectId || 'MISSING',
  allEnvVarsPresent: !!(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId)
});

// Initialize Firebase
let app;
let auth;
let db;

// Check if Firebase config is valid (NEW, simpler check)
const isConfigValid = firebaseConfig.apiKey && 
  firebaseConfig.apiKey.length > 0 &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId.length > 0 &&
  firebaseConfig.authDomain &&
  firebaseConfig.authDomain.length > 0;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
    console.log('Firebase Auth Domain:', firebaseConfig.authDomain);
    console.log('Firebase Project ID:', firebaseConfig.projectId);
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    console.warn('Firebase will work in anonymous mode. Please configure Firebase to enable authentication and history features.');
  }
} else {
  console.warn('⚠️ Firebase configuration not provided or invalid. Authentication and history features will be disabled.');
  console.warn('Current config state:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId
  });
  console.warn('To enable Firebase features, please set environment variables in .env file:');
  console.warn('  VITE_FIREBASE_API_KEY=your-api-key');
  console.warn('  VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com');
  console.warn('  VITE_FIREBASE_PROJECT_ID=your-project-id');
  console.warn('  VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com');
  console.warn('  VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012');
  console.warn('  VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789');
  console.warn('');
  console.warn('After updating .env file, restart the development server with: npm run dev');
}

/**
 * Authentication Functions
 */

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<UserCredential>} User credential
 */
export async function signUp(email, password) {
  if (!auth) {
    throw new Error('Firebase Authentication is not initialized. Please configure Firebase.');
  }
  try {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<UserCredential>} User credential
 */
export async function signIn(email, password) {
  if (!auth) {
    throw new Error('Firebase Authentication is not initialized. Please configure Firebase.');
  }
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  if (!auth) {
    throw new Error('Firebase Authentication is not initialized. Please configure Firebase.');
  }
  try {
    const { signOut: firebaseSignOut } = await import('firebase/auth');
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get current user
 * @returns {User|null} Current user or null
 */
export function getCurrentUser() {
  return auth?.currentUser || null;
}

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function with user parameter
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChanged(callback) {
  if (!auth) {
    // If Firebase not initialized, call callback immediately and return empty unsubscribe
    console.warn('Firebase auth not initialized. Auth state listener will not work.');
    callback(null);
    return () => {};
  }
  
  // Use Firebase auth onAuthStateChanged directly (imported at top as firebaseOnAuthStateChanged)
  try {
    if (typeof firebaseOnAuthStateChanged !== 'function') {
      throw new Error('firebaseOnAuthStateChanged is not a function');
    }
    return firebaseOnAuthStateChanged(auth, callback);
  } catch (error) {
    console.error('Error setting up auth state listener:', error);
    console.error('Error details:', {
      errorType: error.constructor.name,
      message: error.message,
      authExists: !!auth,
      firebaseOnAuthStateChangedType: typeof firebaseOnAuthStateChanged
    });
    callback(null);
    return () => {};
  }
}

/**
 * Firestore Functions
 */

/**
 * Save assessment report to Firestore
 * @param {string} userId - User ID
 * @param {Object} analysis - Analysis results object
 * @param {number} videoId - Video ID from IndexedDB
 * @returns {Promise<string>} Document ID
 */
export async function saveAssessmentReport(userId, analysis, videoId) {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const reportData = {
      userId,
      videoId,
      overallScore: analysis.overallScore,
      scores: analysis.scores,
      recommendedSports: analysis.recommendedSports.map(sport => ({
        id: sport.id,
        name: sport.name,
        suitabilityScore: sport.suitabilityScore,
        meetsRequirements: sport.meetsRequirements
      })),
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'assessments'), reportData);
    console.log('Assessment report saved to Firestore:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving assessment report:', error);
    throw error;
  }
}

/**
 * Get user's assessment history from Firestore
 * @param {string} userId - User ID
 * @param {number} limitCount - Maximum number of reports to fetch (default: 50)
 * @returns {Promise<Array>} Array of assessment reports
 */
export async function getUserAssessmentHistory(userId, limitCount = 50) {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const q = query(
      collection(db, 'assessments'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const reports = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.createdAt || new Date().toISOString()
      });
    });

    return reports;
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    throw error;
  }
}

/**
 * Get a single assessment report by ID
 * @param {string} reportId - Report document ID
 * @returns {Promise<Object>} Assessment report
 */
export async function getAssessmentReport(reportId) {
  try {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'assessments', reportId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Ensure recommendedSports have scoreBreakdown
      const recommendedSports = (data.recommendedSports || []).map(sport => ({
        ...sport,
        scoreBreakdown: sport.scoreBreakdown || {
          agility: data.scores?.agility || 0,
          balance: data.scores?.balance || 0,
          coordination: data.scores?.coordination || 0,
          reactionTime: data.scores?.reactionTime || 0
        }
      }));
      
      return {
        id: docSnap.id,
        overallScore: data.overallScore,
        scores: data.scores,
        recommendedSports: recommendedSports,
        sportsSuitability: recommendedSports, // Use recommendedSports as sportsSuitability
        suggestions: data.suggestions || [],
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        createdAt: data.createdAt || new Date().toISOString()
      };
    } else {
      throw new Error('Report not found');
    }
  } catch (error) {
    console.error('Error fetching assessment report:', error);
    throw error;
  }
}

export { auth, db, app };
