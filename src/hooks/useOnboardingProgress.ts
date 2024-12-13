import { useState, useEffect } from 'react';
import { logger } from '../lib/logger';
import { hotelStorage } from '../lib/storage';

export interface OnboardingProgress {
  step: string;
  completed: boolean;
  timestamp: string;
  completedSteps: {
    bank?: boolean;
    rooms?: boolean;
    staff?: boolean;
  };
}

export function useOnboardingProgress() {
  const [progress, setProgress] = useState<OnboardingProgress>({
    step: 'registration',
    completed: false,
    timestamp: new Date().toISOString(),
    completedSteps: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    try {
      const stored = localStorage.getItem('onboardingProgress');
      const hotelData = hotelStorage.getHotel();
      
      if (stored) {
        const storedProgress = JSON.parse(stored);
        // Sync with hotel data
        storedProgress.completedSteps = {
          bank: hotelData?.bankAccountAdded || false,
          rooms: hotelData?.roomsAdded || false,
          staff: hotelData?.staffAdded || false
        };
        setProgress(storedProgress);
      }

      logger.info('Loaded onboarding progress', { 
        step: progress.step,
        completedSteps: progress.completedSteps 
      }, 'OnboardingProgress');
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to load onboarding progress', err, 'OnboardingProgress');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (step: string) => {
    try {
      const hotelData = hotelStorage.getHotel();
      const newProgress = {
        step,
        completed: step === 'completed',
        timestamp: new Date().toISOString(),
        completedSteps: {
          ...progress.completedSteps,
          [step]: true
        }
      };
      
      // Update hotel data
      hotelStorage.updateHotel({
        ...hotelData,
        [`${step}Added`]: true
      });
      
      localStorage.setItem('onboardingProgress', JSON.stringify(newProgress));
      setProgress(newProgress);
      
      logger.success('Updated onboarding progress', { 
        step,
        completedSteps: newProgress.completedSteps 
      }, 'OnboardingProgress');
      
      return true;
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to update onboarding progress', err, 'OnboardingProgress');
      return false;
    }
  };

  const checkStepCompletion = (step: string): boolean => {
    return Boolean(progress.completedSteps[step as keyof typeof progress.completedSteps]);
  };

  return {
    progress,
    loading,
    error,
    updateProgress,
    checkStepCompletion
  };
}