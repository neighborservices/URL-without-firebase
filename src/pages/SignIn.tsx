import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ActionLogger } from '../components/ActionLogger';
import { logger } from '../lib/logger';

export function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsLoading(true);
      setError('');
      logger.action('submit', 'SignIn', { email: formData.email });

      const success = await login(formData.email, formData.password);
      if (success) {
        logger.success('Login successful', { email: formData.email });
        navigate('/', { replace: true });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
      logger.error('Login failed', { error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRegisterClick = () => {
    logger.action('navigate', 'SignIn', { to: '/onboarding/registration' });
    navigate('/onboarding/registration');
  };

  const handleSuperAdminClick = () => {
    logger.action('navigate', 'SignIn', { to: '/super-admin' });
    navigate('/super-admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-[#0B4619] mb-8">TipCard</h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-[#0B4619] focus:border-[#0B4619]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-[#0B4619] focus:border-[#0B4619]"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#0B4619] hover:bg-[#0B4619]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B4619] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>

            <div className="flex flex-col gap-4 mt-6">
              <button
                type="button"
                onClick={handleRegisterClick}
                className="text-[#0B4619] hover:text-[#0B4619]/90 text-lg font-medium"
              >
                New hotel? Register here
              </button>

              <button
                type="button"
                onClick={handleSuperAdminClick}
                className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Super Admin Access
              </button>
            </div>
          </form>
        </div>
      </div>
      <ActionLogger />
    </div>
  );
}