import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HotelProvider } from './contexts/HotelContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StaffAssignment from './pages/StaffAssignment';
import DailyAssignment from './pages/DailyAssignment';
import Rooms from './pages/Rooms';
import Account from './pages/Account';
import Reports from './pages/Reports';
import { SignIn } from './pages/SignIn';
import TipPayment from './pages/TipPayment';
import Onboarding from './pages/Onboarding';
import SuperAdmin from './pages/SuperAdmin';
import { useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import { ActionLogger } from './components/ActionLogger';
import { logger } from './lib/logger';
import { OnboardingRoute } from './components/OnboardingRoute';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    logger.warning('Unauthorized access attempt, redirecting to sign in');
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    logger.info('Already authenticated, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public tip payment route - no auth required */}
        <Route path="/tip/:roomId" element={<TipPayment />} />
        
        {/* Public auth routes */}
        <Route 
          path="/signin" 
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/onboarding/*" 
          element={
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          } 
        />
        
        <Route path="/super-admin/*" element={<SuperAdmin />} />
        
        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <HotelProvider>
                <div className="flex min-h-screen bg-gray-50">
                  <Sidebar />
                  <main className="flex-1 ml-64">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/staff-assignment" element={<StaffAssignment />} />
                      <Route path="/daily-assignment" element={<DailyAssignment />} />
                      <Route path="/rooms" element={<Rooms />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <ActionLogger />
                </div>
              </HotelProvider>
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}