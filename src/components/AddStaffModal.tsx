import React, { useState } from 'react';
import { X, Loader2, AlertCircle, Hash } from 'lucide-react';
import { logger } from '../lib/logger';

interface AddStaffModalProps {
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  currentStaffCount: number;
}

interface StaffIdConfig {
  type: 'auto' | 'prefix' | 'manual';
  prefix?: string;
  manualId?: string;
}

const AddStaffModal = ({ onClose, onSubmit, isSubmitting, currentStaffCount }: AddStaffModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    role: 'housekeeper',
    email: '',
    phone: ''
  });

  const [staffIdConfig, setStaffIdConfig] = useState<StaffIdConfig>({
    type: 'auto'
  });
  
  const [error, setError] = useState<string | null>(null);

  const generateStaffId = () => {
    const number = String(currentStaffCount + 1).padStart(3, '0');
    switch (staffIdConfig.type) {
      case 'prefix':
        return `${staffIdConfig.prefix || 'STAFF'}-${number}`;
      case 'manual':
        return staffIdConfig.manualId;
      default:
        return number;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      const staffId = generateStaffId();
      if (staffIdConfig.type === 'manual' && !staffId) {
        throw new Error('Staff ID is required');
      }

      logger.action('submit', 'AddStaffModal', { 
        staffName: formData.name,
        staffIdType: staffIdConfig.type 
      });

      await onSubmit({
        ...formData,
        staffId
      });

      logger.success('Staff member added', { 
        staffId,
        staffName: formData.name 
      });
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to add staff member', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Staff Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff ID Generation
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={staffIdConfig.type === 'auto'}
                  onChange={() => setStaffIdConfig({ type: 'auto' })}
                  className="mr-2"
                />
                Automatic (e.g., 001)
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={staffIdConfig.type === 'prefix'}
                  onChange={() => setStaffIdConfig({ type: 'prefix', prefix: 'STAFF' })}
                  className="mr-2"
                />
                With Prefix
              </label>
              
              {staffIdConfig.type === 'prefix' && (
                <input
                  type="text"
                  value={staffIdConfig.prefix}
                  onChange={(e) => setStaffIdConfig({ 
                    type: 'prefix', 
                    prefix: e.target.value 
                  })}
                  placeholder="Enter prefix"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              )}
              
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={staffIdConfig.type === 'manual'}
                  onChange={() => setStaffIdConfig({ type: 'manual' })}
                  className="mr-2"
                />
                Manual Input
              </label>
              
              {staffIdConfig.type === 'manual' && (
                <input
                  type="text"
                  value={staffIdConfig.manualId}
                  onChange={(e) => setStaffIdConfig({ 
                    type: 'manual', 
                    manualId: e.target.value 
                  })}
                  placeholder="Enter Staff ID"
                  className="w-full px-4 py-2 border rounded-lg"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="housekeeper">Housekeeper</option>
              <option value="concierge">Concierge</option>
              <option value="bellhop">Bellhop</option>
              <option value="valet">Valet</option>
              <option value="roomservice">Room Service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Staff Member'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;