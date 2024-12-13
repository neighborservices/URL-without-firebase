import React from 'react';
import { Users } from 'lucide-react';
import type { Staff, Room } from '../types';

interface RoomAssignmentDetailsProps {
  room: Room;
  assignedStaff: Staff[];
}

const RoomAssignmentDetails = ({ room, assignedStaff }: RoomAssignmentDetailsProps) => {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Assigned Staff</h4>
      <div className="space-y-2">
        {assignedStaff.length === 0 ? (
          <p className="text-sm text-gray-500">No staff assigned to this room</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assignedStaff.map(member => (
              <div 
                key={member.id} 
                className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border"
              >
                <div className="w-6 h-6 rounded-full bg-[#B4F481] flex items-center justify-center text-[#0B4619] text-sm font-medium">
                  {member.name.charAt(0)}
                </div>
                <span className="text-sm font-medium">{member.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomAssignmentDetails;