import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState(prev => ({
        ...prev,
        user,
        loading: false
      }));
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      await signOut(auth);
      return true;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
      return false;
    }
  };

  return {
    ...state,
    login,
    logout,
    register
  };
}