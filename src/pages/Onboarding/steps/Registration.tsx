import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Lock, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { hotelStorage } from '../../../lib/storage';

interface RegistrationProps {
  onComplete: () => void;
}

const getDemoData = () => ({
  hotelName: `Grand Hotel ${Math.floor(Math.random() * 1000)}`,
  email: `manager${Math.floor(Math.random() * 1000)}@grandhotel.com`,
  password: 'demo123456',
  confirmPassword: 'demo123456',
  phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
  address: `${Math.floor(Math.random() * 1000)} Luxury Avenue`,
  city: 'Beverly Hills',
  state: 'CA',
  zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
});

const Registration = ({ onComplete }: RegistrationProps) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hotelName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillDemoData = () => {
    setFormData(getDemoData());
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Register user
      const success = await register(formData.email, formData.password);
      if (!success) {
        throw new Error('Registration failed');
      }

      // Save hotel data
      const hotelData = {
        hotelName: formData.hotelName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingStep: 'registration',
        onboardingComplete: false,
        bankAccountAdded: false,
        roomsAdded: false,
        staffAdded: false
      };

      hotelStorage.setHotel(hotelData);

      // Initialize empty collections
      localStorage.setItem('rooms', JSON.stringify([]));
      localStorage.setItem('staff', JSON.stringify([]));
      localStorage.setItem('assignments', JSON.stringify([]));

      // Set initial onboarding progress
      localStorage.setItem('onboardingProgress', JSON.stringify({
        step: 'registration',
        completed: false,
        timestamp: new Date().toISOString()
      }));

      // Call onComplete callback
      onComplete();

      // Navigate to bank details page
      navigate('/onboarding/bank', { replace: true });

    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError('');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Hotel Information</h2>
        <button
          type="button"
          onClick={fillDemoData}
          className="flex items-center gap-2 px-4 py-2 text-[#0B4619] bg-[#B4F481] rounded-lg hover:bg-[#B4F481]/80 transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          Fill with Demo Data
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="hotelName"
              value={formData.hotelName}
              onChange={handleChange}
              placeholder="Hotel Name"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4619] focus:border-[#0B4619] text-lg"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4619] focus:border-[#0B4619] text-lg"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              minLength={6}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4619] focus:border-[#0B4619] text-lg"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              minLength={6}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4619] focus:border-[#0B4619] text-lg"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4619] focus:border-[#0B4619] text-lg"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street Address"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4619] focus:border-[#0B4619] text-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4619] focus:border-[#0B4619] text-lg"
            />
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4619] focus:border-[#0B4619] text-lg"
            />
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="ZIP Code"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B4619] focus:border-[#0B4619] text-lg"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#0B4619] text-white py-3 rounded-lg hover:bg-[#0B4619]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>
    </div>
  );
};

export default Registration;