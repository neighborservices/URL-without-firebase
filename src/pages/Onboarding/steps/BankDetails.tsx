import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Building, User, Loader2, AlertCircle } from 'lucide-react';
import { hotelStorage, onboardingStorage } from '../../../lib/storage';

interface BankDetailsProps {
  onComplete: () => void;
}

const BankDetails = ({ onComplete }: BankDetailsProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    routingNumber: '',
    accountNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Update hotel data with bank details
      hotelStorage.updateHotel({
        bankDetails: {
          ...formData,
          updatedAt: new Date().toISOString(),
          status: 'pending_verification'
        },
        bankAccountAdded: true
      });

      // Update onboarding progress
      onboardingStorage.setProgress('bank_complete');

      onComplete();
      navigate('/');
    } catch (err: any) {
      console.error('Error saving bank details:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Bank Account Details</h2>
      <p className="text-gray-600 mb-8">
        Add your bank account information for receiving tip payments. This information will be securely stored.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              placeholder="Account Holder Name"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Bank Name"
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="routingNumber"
              value={formData.routingNumber}
              onChange={handleChange}
              placeholder="Routing Number"
              required
              pattern="^\d{9}$"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Account Number"
              required
              pattern="^\d{8,17}$"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            Your bank account information is stored securely.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 py-3 rounded-lg transition-colors border border-gray-300 hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center py-3 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving Details...
              </>
            ) : (
              'Save Bank Details'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BankDetails;