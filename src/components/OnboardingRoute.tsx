import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useHotel } from '../contexts/HotelContext';
import LoadingScreen from './LoadingScreen';
import { logger } from '../lib/logger';

interface OnboardingRouteProps {
  children: React.ReactNode;
}

export const OnboardingRoute: React.FC<OnboardingRouteProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { hotelData, loading: hotelLoading } = useHotel();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      logger.info('Onboarding route accessed', { 
        path: location.pathname,
        user: user.id
      });
    }
  }, [user, location.pathname]);

  if (authLoading || hotelLoading) {
    return <LoadingScreen />;
  }

  // Allow access to registration without authentication
  if (location.pathname === '/onboarding/registration') {
    if (user) {
      logger.info('Authenticated user accessing registration, redirecting to dashboard');
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // Require authentication for other onboarding steps
  if (!user) {
    logger.warning('Unauthorized access to onboarding', { path: location.pathname });
    return <Navigate to="/signin" replace />;
  }

  // Get current step from pathname
  const currentStep = location.pathname.split('/').pop();

  // Check if step is completed
  if (currentStep && hotelData) {
    const stepCompleted = hotelData[`${currentStep}Added`];
    if (stepCompleted) {
      logger.info('Step already completed, redirecting to dashboard', { step: currentStep });
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};