import React from 'react';
import type { Staff } from '../../types';

interface StaffListProps {
  staff: Staff[];
  selectedStaff: string[];
  onStaffSelect: (staffId: string) => void;
}

const StaffList = ({ staff, selectedStaff, onStaffSelect }: StaffListProps) => {
  return (
    <div className="space-y-2">
      {staff.map(member => (
        <div
          key={member.id}
          onClick={() => onStaffSelect(member.id)}
          className={`p-4 rounded-lg cursor-pointer transition-colors ${
            selectedStaff.includes(member.id)
              ? 'bg-[#B4F481] border-2 border-[#0B4619]'
              : 'bg-white border border-gray-200 hover:border-[#0B4619]'
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                    {member.name.charAt(0)}
                  </div>
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <span className="text-sm text-gray-500">({member.staffId})</span>
              </div>
              <p className="text-sm text-gray-500">{member.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StaffList;