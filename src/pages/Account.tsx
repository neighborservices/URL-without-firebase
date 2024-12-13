import React, { useState, useEffect } from 'react';
import { PencilIcon, CreditCard, Building2, CheckCircle2, Plus, AlertCircle, Loader2, Clock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import ShiftManagement from '../components/ShiftManagement';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51QFZt8GMXInbuTdwO7A384TlV2KK4bCX4CrEjO6iEjNfC6BolYR3E23L3txmgMl5OouOvxcx691j22hUdffIAJcd00QlXj7feI';

interface BankDetails {
  accountName: string;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
}

interface HotelDetails {
  hotelName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AlertState {
  type: 'success' | 'error';
  message: string;
}

const Account = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'shifts'>('general');
  const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setIsLoading(true);
      // Load hotel and bank details from localStorage
      const storedHotelDetails = localStorage.getItem('hotelDetails');
      const storedBankDetails = localStorage.getItem('bankDetails');
      
      if (storedHotelDetails) {
        setHotelDetails(JSON.parse(storedHotelDetails));
      }
      if (storedBankDetails) {
        setBankDetails(JSON.parse(storedBankDetails));
      }

      // Simulate balance (in a real app, this would come from your backend)
      setBalance(25350.53);
    } catch (error) {
      showAlert('error', 'Failed to load account data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000); // Clear alert after 5 seconds
  };

  const handleShiftSave = () => {
    showAlert('success', 'Shift configuration saved successfully');
  };

  if (isLoading && !hotelDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading account details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {alert && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
            alert.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p>{alert.message}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'general'
                  ? 'border-b-2 border-[#0B4619] text-[#0B4619]'
                  : 'text-gray-500'
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`px-6 py-4 font-medium flex items-center gap-2 ${
                activeTab === 'shifts'
                  ? 'border-b-2 border-[#0B4619] text-[#0B4619]'
                  : 'text-gray-500'
              }`}
            >
              <Clock className="w-5 h-5" />
              Shift Management
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'general' ? (
            <div className="space-y-6">
              {/* General settings content */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Section */}
                <div className="bg-white rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-gray-600">
                          {hotelDetails?.hotelName?.[0] || 'H'}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{hotelDetails?.hotelName}</h2>
                        <p className="text-gray-500">{hotelDetails?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className="text-blue-600 hover:text-blue-700"
                      disabled={isLoading}
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-gray-900">{hotelDetails?.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="mt-1 text-gray-900">
                        {hotelDetails?.address}, {hotelDetails?.city}, {hotelDetails?.state} {hotelDetails?.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Account */}
                {bankDetails && (
                  <div className="bg-white rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-gray-400" />
                        <h3 className="text-lg font-medium">Bank Account</h3>
                      </div>
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-600">Account Name: {bankDetails.accountName}</p>
                      <p className="text-gray-600">Bank: {bankDetails.bankName}</p>
                      <p className="text-gray-600">
                        Account: ****{bankDetails.accountNumber.slice(-4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ShiftManagement onSave={handleShiftSave} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;