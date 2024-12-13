import { useState, useEffect } from 'react';
import type { ShiftConfig, Shift } from '../types';
import { 
  DEFAULT_SHIFTS, 
  validateShiftTimes, 
  saveShiftConfig, 
  loadShiftConfig 
} from '../lib/utils/shiftUtils';
import { logger } from '../lib/logger';

export function useShiftManagement() {
  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>({
    type: 'default',
    shifts: DEFAULT_SHIFTS
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedConfig();
  }, []);

  const loadSavedConfig = () => {
    try {
      setLoading(true);
      const config = loadShiftConfig();
      setShiftConfig(config);
      logger.info('Loaded shift configuration', { 
        type: config.type,
        shiftsCount: config.shifts.length 
      });
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to load shift configuration', err);
    } finally {
      setLoading(false);
    }
  };

  const updateShiftConfig = async (newConfig: ShiftConfig) => {
    try {
      setError(null);
      
      // If switching to default, reset shifts
      if (newConfig.type === 'default') {
        newConfig.shifts = DEFAULT_SHIFTS;
      }
      
      // Validate custom shifts
      if (newConfig.type === 'custom') {
        const validationError = validateShiftTimes(newConfig.shifts);
        if (validationError) {
          throw new Error(validationError);
        }
      }

      // Save configuration
      await saveShiftConfig(newConfig);
      setShiftConfig(newConfig);
      
      logger.success('Updated shift configuration', { 
        type: newConfig.type,
        shiftsCount: newConfig.shifts.length 
      });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to update shift configuration', err);
      return false;
    }
  };

  const addCustomShift = (shift: Omit<Shift, 'id'>) => {
    try {
      const newShift = {
        ...shift,
        id: Date.now().toString(),
        isActive: true
      };

      const newConfig = {
        type: 'custom',
        shifts: [...shiftConfig.shifts, newShift]
      };

      const validationError = validateShiftTimes(newConfig.shifts);
      if (validationError) {
        throw new Error(validationError);
      }

      updateShiftConfig(newConfig);
      logger.success('Added custom shift', { shift: newShift });
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to add custom shift', err);
    }
  };

  const removeShift = (shiftId: string) => {
    try {
      const newConfig = {
        ...shiftConfig,
        shifts: shiftConfig.shifts.filter(s => s.id !== shiftId)
      };

      updateShiftConfig(newConfig);
      logger.success('Removed shift', { shiftId });
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to remove shift', err);
    }
  };

  return {
    shiftConfig,
    loading,
    error,
    updateShiftConfig,
    addCustomShift,
    removeShift
  };
}