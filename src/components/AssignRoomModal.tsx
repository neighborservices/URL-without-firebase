import React, { useState } from 'react';
import { X, Loader2, AlertCircle, DoorClosed } from 'lucide-react';
import type { Room } from '../types';

interface AssignRoomModalProps {
  staffId: string;
  rooms: Room[];
  onClose: () => void;
  onAssign: (roomId: string) => Promise<void>;
  isSubmitting: boolean;
}

const AssignRoomModal = ({ staffId, rooms, onClose, onAssign, isSubmitting }: AssignRoomModalProps) => {
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedRoom) return;

    try {
      await onAssign(selectedRoom);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Assign Room</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Room
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Choose a room...</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  Room {room.number} (Floor {room.floor})
                </option>
              ))}
            </select>
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
              disabled={isSubmitting || !selectedRoom}
              className="flex-1 px-4 py-2 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Room'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignRoomModal;