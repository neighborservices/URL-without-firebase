import React from 'react';
import { DoorClosed, QrCode } from 'lucide-react';
import type { Room } from '../types';
import StaffCard from './StaffCard';

interface RoomCardProps {
  room: Room;
  onGenerateQR: (roomId: string) => void;
}

const RoomCard = ({ room, onGenerateQR }: RoomCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <DoorClosed className="w-6 h-6 text-gray-400" />
          <div>
            <h3 className="text-lg font-medium text-gray-800">Room {room.number}</h3>
            <p className="text-sm text-gray-500">Floor {room.floor}</p>
          </div>
        </div>
        <button
          onClick={() => onGenerateQR(room.id)}
          className="p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <QrCode className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600">Assigned Staff</h4>
        {room.assignedStaff.map((staff) => (
          <StaffCard key={staff.id} staff={staff} assigned />
        ))}
      </div>
    </div>
  );
};

export default RoomCard;