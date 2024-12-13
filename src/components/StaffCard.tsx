import React from 'react';
import { User } from 'lucide-react';
import type { Staff } from '../types';

interface StaffCardProps {
  staff: Staff;
  onAssign?: () => void;
  assigned?: boolean;
}

const StaffCard = ({ staff, onAssign, assigned }: StaffCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {staff.image ? (
          <img
            src={staff.image}
            alt={staff.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div>
          <h3 className="font-medium text-gray-800">{staff.name}</h3>
          <p className="text-sm text-gray-500">{staff.role}</p>
        </div>
      </div>
      {onAssign && (
        <button
          onClick={onAssign}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            assigned
              ? 'bg-green-50 text-green-600 hover:bg-green-100'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          {assigned ? 'Assigned' : 'Assign'}
        </button>
      )}
    </div>
  );
};

export default StaffCard;