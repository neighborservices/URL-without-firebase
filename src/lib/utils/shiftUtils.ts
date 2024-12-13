import { ShiftConfig, Shift } from '../../types';
import { logger } from '../logger';

export const DEFAULT_SHIFTS: Shift[] = [
  {
    id: 'morning',
    name: 'Morning',
    startTime: '06:00',
    endTime: '14:00',
    isActive: true
  },
  {
    id: 'evening',
    name: 'Evening',
    startTime: '14:00',
    endTime: '22:00',
    isActive: true
  }
];

export const validateShiftTimes = (shifts: Shift[]): string | null => {
  try {
    // Check for overlapping shifts
    for (let i = 0; i < shifts.length; i++) {
      const current = shifts[i];
      const currentStart = new Date(`1970-01-01T${current.startTime}`);
      const currentEnd = new Date(`1970-01-01T${current.endTime}`);

      // Validate individual shift
      if (currentStart >= currentEnd) {
        return `Invalid time range for shift "${current.name}"`;
      }

      // Check overlap with other shifts
      for (let j = i + 1; j < shifts.length; j++) {
        const other = shifts[j];
        const otherStart = new Date(`1970-01-01T${other.startTime}`);
        const otherEnd = new Date(`1970-01-01T${other.endTime}`);

        if (
          (currentStart >= otherStart && currentStart < otherEnd) ||
          (currentEnd > otherStart && currentEnd <= otherEnd)
        ) {
          return `Shift "${current.name}" overlaps with "${other.name}"`;
        }
      }
    }

    return null;
  } catch (error) {
    logger.error('Shift validation error', error);
    return 'Invalid shift times';
  }
};

export const saveShiftConfig = async (config: ShiftConfig): Promise<void> => {
  try {
    // Validate shift times if custom configuration
    if (config.type === 'custom') {
      const validationError = validateShiftTimes(config.shifts);
      if (validationError) {
        throw new Error(validationError);
      }
    }

    // Save to localStorage
    localStorage.setItem('shiftConfig', JSON.stringify(config));
    
    // Update hotel data
    const hotelData = JSON.parse(localStorage.getItem('hotel') || '{}');
    hotelData.shiftConfig = config;
    localStorage.setItem('hotel', JSON.stringify(hotelData));
    
    logger.success('Shift configuration saved', { 
      type: config.type,
      shiftsCount: config.shifts.length 
    });
  } catch (error) {
    logger.error('Failed to save shift configuration', error);
    throw error;
  }
};

export const loadShiftConfig = (): ShiftConfig => {
  try {
    // First try to load from hotel data
    const hotelData = JSON.parse(localStorage.getItem('hotel') || '{}');
    if (hotelData.shiftConfig) {
      return hotelData.shiftConfig;
    }

    // Then try standalone shift config
    const stored = localStorage.getItem('shiftConfig');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // If no config exists, return default
    return {
      type: 'default',
      shifts: DEFAULT_SHIFTS
    };
  } catch (error) {
    logger.error('Failed to load shift configuration', error);
    return {
      type: 'default',
      shifts: DEFAULT_SHIFTS
    };
  }
};

export const validateShiftConfig = (config: ShiftConfig): string | null => {
  if (config.type === 'custom' && config.shifts.length === 0) {
    return 'Please add at least one shift';
  }

  if (config.type === 'custom') {
    // Validate each shift has required fields
    for (const shift of config.shifts) {
      if (!shift.name || !shift.startTime || !shift.endTime) {
        return 'All shift details are required';
      }
    }

    // Validate shift times
    return validateShiftTimes(config.shifts);
  }

  return null;
};