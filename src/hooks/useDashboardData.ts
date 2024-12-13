import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Staff, Room, Tip } from '../types';

interface DashboardData {
  staff: Staff[];
  rooms: Room[];
  recentTips: Tip[];
  loading: boolean;
  error: string | null;
}

export const useDashboardData = (): DashboardData => {
  const [staff] = useLocalStorage<Staff[]>('staff', []);
  const [rooms] = useLocalStorage<Room[]>('rooms', []);
  const [tips] = useLocalStorage<Tip[]>('tips', []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  }, []);

  const sortedTips = [...tips].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10);

  return {
    staff,
    rooms,
    recentTips: sortedTips,
    loading,
    error
  };
};