import { useState, useEffect } from 'react';
import { staffStorage } from '../lib/storage';
import { logger } from '../lib/logger';
import type { Staff } from '../types';

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = () => {
    try {
      const loadedStaff = staffStorage.getAll();
      setStaff(loadedStaff);
      logger.info('Staff loaded', { count: loadedStaff.length });
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to load staff', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const createStaff = async (staffData: Omit<Staff, 'id'>) => {
    try {
      setError(null);
      const newStaff = {
        id: Date.now().toString(),
        ...staffData,
        createdAt: new Date().toISOString()
      };

      // Save to storage
      staffStorage.add(newStaff as Staff);
      
      // Update local state
      setStaff(prev => [...prev, newStaff as Staff]);
      
      // Force reload staff list to ensure consistency
      loadStaff();
      
      logger.success('Staff member added', { staffId: newStaff.id });
      return { success: true, staffId: newStaff.id };
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to add staff member', err);
      return { success: false, error: err.message };
    }
  };

  return {
    staff,
    loading,
    error,
    createStaff,
    reloadStaff: loadStaff
  };
}