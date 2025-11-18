/**
 * AuthContext.jsx
 * Authentication context provider for managing user state
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, getCurrentUser } from '../utils/firebase';

const AuthContext = createContext(null);

/**
 * AuthProvider component
 * Provides authentication state to the entire app
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    let mounted = true;
    
    // Check if Firebase is available
    if (typeof window !== 'undefined') {
      
      let currentUser = null;
      // 1. Wrap the synchronous call to getCurrentUser in a try/catch
      try {
        currentUser = getCurrentUser();
      } catch (error) {
        // If an error is thrown (e.g., Firebase Auth not initialized), currentUser remains null.
        console.error("AuthContext: Synchronous Firebase call failed (Uninitialized).", error.message);
      }

      if (currentUser && mounted) {
        setUser(currentUser);
        setLoading(false);
      }

      // 2. Set up auth state listener using our utility function
      try {
        // This is wrapped to catch initialization errors if they occur here
        unsubscribe = onAuthStateChanged((firebaseUser) => {
          if (mounted) {
            setUser(firebaseUser);
            setLoading(false);
          }
        });
      } catch (error) {
        // If the listener setup fails, handle the uninitialized state gracefully
        if (error.message.includes('Firebase Authentication is not initialized')) {
            console.error('AuthContext: Firebase Auth is completely uninitialized. Authentication features disabled.');
        } else {
            console.warn('Error setting up auth listener:', error);
        }
        if (mounted && !currentUser) {
          setLoading(false);
        }
      }

      // If no current user and listener doesn't fire quickly, set loading to false
      if (!currentUser) {
        const timeout = setTimeout(() => {
          if (mounted) {
            setLoading(false);
          }
        }, 2000);
        
        return () => {
          mounted = false;
          clearTimeout(timeout);
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      }
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;