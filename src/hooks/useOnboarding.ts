import { useState } from 'react';

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(false);

  const register = async (formData: any) => {
    try {
      setIsLoading(true);
      
      // Store registration data
      localStorage.setItem('hotelData', JSON.stringify(formData));

      // Generate a demo organization ID
      const orgId = 'org_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      localStorage.setItem('orgId', orgId);

      return { success: true, orgId };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('orgId');
  };

  return {
    isLoading,
    register,
    completeOnboarding,
    resetOnboarding
  };
}