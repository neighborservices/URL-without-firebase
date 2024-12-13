import { useState } from 'react';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../lib/firebase/db';
import { auth } from '../lib/firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export const useOnboardingFlow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerHotel = async (hotelData: any) => {
    try {
      setLoading(true);
      setError(null);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        hotelData.email,
        hotelData.password
      );

      // Generate organization ID
      const orgId = `HTL-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`.toUpperCase();

      // Create hotel document
      const db = await getDb();
      const hotelRef = doc(db, 'hotels', orgId);
      
      await setDoc(hotelRef, {
        ...hotelData,
        orgId,
        uid: userCredential.user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        subscription: 'trial',
        settings: {
          onboardingComplete: false,
          currency: 'USD',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });

      // Store orgId for future use
      localStorage.setItem('orgId', orgId);

      return { success: true, orgId };
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const saveBankDetails = async (bankData: any) => {
    try {
      setLoading(true);
      setError(null);

      const orgId = localStorage.getItem('orgId');
      if (!orgId) throw new Error('Organization ID not found');

      const db = await getDb();
      const bankRef = doc(collection(db, `hotels/${orgId}/bankDetails`));
      
      await setDoc(bankRef, {
        ...bankData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending_verification'
      });

      return { success: true };
    } catch (err: any) {
      console.error('Bank details error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const saveRooms = async (rooms: any[]) => {
    try {
      setLoading(true);
      setError(null);

      const orgId = localStorage.getItem('orgId');
      if (!orgId) throw new Error('Organization ID not found');

      const db = await getDb();
      const roomsRef = collection(db, `hotels/${orgId}/rooms`);

      // Create all rooms in parallel
      await Promise.all(
        rooms.map(room => 
          setDoc(doc(roomsRef), {
            ...room,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'available',
            assignedStaff: []
          })
        )
      );

      return { success: true };
    } catch (err: any) {
      console.error('Rooms error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const saveStaff = async (staffMembers: any[]) => {
    try {
      setLoading(true);
      setError(null);

      const orgId = localStorage.getItem('orgId');
      if (!orgId) throw new Error('Organization ID not found');

      const db = await getDb();
      const staffRef = collection(db, `hotels/${orgId}/staff`);

      // Create all staff members in parallel
      await Promise.all(
        staffMembers.map(staff => 
          setDoc(doc(staffRef), {
            ...staff,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'active',
            assignedRooms: []
          })
        )
      );

      return { success: true };
    } catch (err: any) {
      console.error('Staff error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      setLoading(true);
      setError(null);

      const orgId = localStorage.getItem('orgId');
      if (!orgId) throw new Error('Organization ID not found');

      const db = await getDb();
      const hotelRef = doc(db, 'hotels', orgId);
      
      await setDoc(hotelRef, {
        settings: {
          onboardingComplete: true,
          onboardingCompletedAt: serverTimestamp()
        }
      }, { merge: true });

      return { success: true };
    } catch (err: any) {
      console.error('Onboarding completion error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    registerHotel,
    saveBankDetails,
    saveRooms,
    saveStaff,
    completeOnboarding
  };
};