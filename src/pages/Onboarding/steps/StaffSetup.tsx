import React, { useState } from 'react';
import { Plus, User, Trash2, Loader2, AlertCircle, Hash } from 'lucide-react';
import { staffStorage, onboardingStorage } from '../../../lib/storage';
import { logger } from '../../../lib/logger';
import type { Staff } from '../../../types';

interface StaffSetupProps {
  onComplete: () => void;
}

interface StaffIdConfig {
  type: 'auto' | 'prefix' | 'manual';
  prefix?: string;
  manualId?: string;
}

const StaffSetup = ({ onComplete }: StaffSetupProps) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [currentStaff, setCurrentStaff] = useState({
    name: '',
    role: 'housekeeper',
    email: '',
    phone: ''
  });

  const [staffIdConfig, setStaffIdConfig] = useState<StaffIdConfig>({
    type: 'auto'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStaffId = () => {
    const number = String(staff.length + 1).padStart(3, '0');
    switch (staffIdConfig.type) {
      case 'prefix':
        return `${staffIdConfig.prefix || 'STAFF'}-${number}`;
      case 'manual':
        return staffIdConfig.manualId;
      default:
        return number;
    }
  };

  const validateStaffId = (staffId: string): string | null => {
    if (staff.some(member => member.staffId === staffId)) {
      return 'Staff ID already exists';
    }
    if (staffId.length < 3) {
      return 'Staff ID must be at least 3 characters long';
    }
    return null;
  };

  const addStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const staffId = generateStaffId();
      if (staffIdConfig.type === 'manual' && !staffId) {
        throw new Error('Staff ID is required');
      }

      const validationError = validateStaffId(staffId);
      if (validationError) {
        throw new Error(validationError);
      }

      logger.action('add_staff', 'OnboardingStaffSetup', {
        staffName: currentStaff.name,
        staffIdType: staffIdConfig.type
      });

      const newStaff = {
        id: Date.now().toString(),
        staffId,
        ...currentStaff,
        createdAt: new Date().toISOString()
      };

      setStaff([...staff, newStaff]);
      setCurrentStaff({ name: '', role: 'housekeeper', email: '', phone: '' });
      setError(null);

      logger.success('Staff member added during onboarding', { 
        staffId,
        staffName: currentStaff.name 
      });
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to add staff member during onboarding', err);
    }
  };

  const removeStaffMember = (id: string) => {
    setStaff(staff.filter(member => member.id !== id));
    logger.action('remove_staff', 'OnboardingStaffSetup', { staffId: id });
  };

  const handleSubmit = async () => {
    if (isSubmitting || staff.length === 0) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Save all staff members
      staff.forEach(member => staffStorage.add(member));

      // Update onboarding progress
      onboardingStorage.setProgress('staff_complete');

      logger.success('Staff setup completed', { staffCount: staff.length });
      onComplete();
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to complete staff setup', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Staff Setup</h2>
      <p className="text-gray-600 mb-8">
        Add staff members who will be receiving tips through the system
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Staff ID Configuration</h3>
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
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
      </div>

      <form onSubmit={addStaffMember} className="mb-8">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={currentStaff.name}
            onChange={(e) => setCurrentStaff({ ...currentStaff, name: e.target.value })}
            placeholder="Staff Name"
            required
            className="px-4 py-2 border rounded-lg"
          />
          <select
            value={currentStaff.role}
            onChange={(e) => setCurrentStaff({ ...currentStaff, role: e.target.value })}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="housekeeper">Housekeeper</option>
            <option value="concierge">Concierge</option>
            <option value="bellhop">Bellhop</option>
            <option value="valet">Valet</option>
          </select>
          <input
            type="email"
            value={currentStaff.email}
            onChange={(e) => setCurrentStaff({ ...currentStaff, email: e.target.value })}
            placeholder="Email Address"
            required
            className="px-4 py-2 border rounded-lg"
          />
          <input
            type="tel"
            value={currentStaff.phone}
            onChange={(e) => setCurrentStaff({ ...currentStaff, phone: e.target.value })}
            placeholder="Phone Number"
            required
            className="px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Staff Member
          </button>
        </div>
      </form>

      <div className="space-y-4 mb-8">
        {staff.map(member => (
          <div
            key={member.id}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">{member.role}</p>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                    ID: {member.staffId}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => removeStaffMember(member.id)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || staff.length === 0}
        className={`w-full flex items-center justify-center py-3 rounded-lg transition-colors ${
          isSubmitting || staff.length === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Saving Staff...
          </>
        ) : (
          'Continue'
        )}
      </button>

      {staff.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          Add at least one staff member to continue
        </div>
      )}
    </div>
  );
};

export default StaffSetup;