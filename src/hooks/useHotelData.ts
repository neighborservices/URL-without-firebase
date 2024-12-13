import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc } from 'firebase/firestore';
import { getDb } from '../lib/firebase/db';
import { COLLECTIONS } from '../lib/firebase/collections';

export const useHotelData = (hotelId: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hotelId) return;

    setLoading(true);
    setError(null);

    const unsubscribers: (() => void)[] = [];

    const setupListeners = async () => {
      try {
        const db = await getDb();

        // Hotel document listener
        const hotelRef = doc(db, COLLECTIONS.HOTELS, hotelId);
        const hotelUnsubscribe = onSnapshot(hotelRef, (snapshot) => {
          if (snapshot.exists()) {
            setData(prev => ({ ...prev, hotel: { id: snapshot.id, ...snapshot.data() } }));
          }
        });
        unsubscribers.push(hotelUnsubscribe);

        // Settings listener
        const settingsRef = doc(db, `${COLLECTIONS.HOTELS}/${hotelId}/${COLLECTIONS.SETTINGS}/general`);
        const settingsUnsubscribe = onSnapshot(settingsRef, (snapshot) => {
          if (snapshot.exists()) {
            setData(prev => ({ ...prev, settings: snapshot.data() }));
          }
        });
        unsubscribers.push(settingsUnsubscribe);

        // Payment settings listener
        const paymentRef = doc(db, `${COLLECTIONS.HOTELS}/${hotelId}/${COLLECTIONS.SETTINGS}/payment`);
        const paymentUnsubscribe = onSnapshot(paymentRef, (snapshot) => {
          if (snapshot.exists()) {
            setData(prev => ({ ...prev, paymentSettings: snapshot.data() }));
          }
        });
        unsubscribers.push(paymentUnsubscribe);

        setLoading(false);
      } catch (err: any) {
        console.error('Error setting up hotel data listeners:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [hotelId]);

  return { data, loading, error };
};