import { onboardingStorage } from '../storage';
import { logger } from '../logger';

export const updateOnboardingProgress = (step: string) => {
  try {
    onboardingStorage.setProgress(step);
    logger.success(`Completed onboarding step: ${step}`);
    return true;
  } catch (error) {
    logger.error('Failed to update onboarding progress', error);
    return false;
  }
};

export const checkOnboardingComplete = () => {
  const progress = onboardingStorage.getProgress();
  return progress.completed;
};

export const getNextOnboardingStep = () => {
  const progress = onboardingStorage.getProgress();
  const steps = ['registration', 'bank', 'rooms', 'staff', 'qr'];
  
  for (const step of steps) {
    if (!progress.completedSteps[step]) {
      return step;
    }
  }
  
  return null;
};