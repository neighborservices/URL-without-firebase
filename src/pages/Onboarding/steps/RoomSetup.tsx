import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, DoorClosed, Trash2, Loader2, AlertCircle, Clock } from 'lucide-react';
import { roomStorage, onboardingStorage } from '../../../lib/storage';
import { logger } from '../../../lib/logger';
import type { Room, ShiftConfig } from '../../../types';

interface RoomSetupProps {
  onComplete: () => void;
}

const RoomSetup = ({ onComplete }: RoomSetupProps) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState({
    number: '',
    floor: '',
    type: 'standard'
  });

  const [shiftConfig, setShiftConfig] = useState<ShiftConfig>({
    type: 'default',
    shifts: [
      {
        id: 'morning',
        name: 'Morning',
        startTime: '06:00',
        endTime: '14:00',
        isActive: true
      },
      {
        id: 'evening',
        name: 'Evening',
        startTime: '14:00',
        endTime: '22:00',
        isActive: true
      }
    ]
  });

  const [customShift, setCustomShift] = useState({
    name: '',
    startTime: '',
    endTime: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRoomNumber = (floor: string) => {
    const existingRoomsOnFloor = rooms.filter(r => r.floor === floor);
    const roomCount = existingRoomsOnFloor.length + 1;
    return `${floor}${roomCount.toString().padStart(2, '0')}`;
  };

  const addRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom.floor) {
      setError('Please enter a floor number');
      return;
    }

    const roomNumber = generateRoomNumber(currentRoom.floor);
    const newRoom = {
      id: Date.now().toString(),
      ...currentRoom,
      number: roomNumber,
      assignedStaff: []
    };
    setRooms([...rooms, newRoom]);
    setCurrentRoom({ number: '', floor: '', type: 'standard' });
    setError(null);
    logger.success('Room added', { roomNumber });
  };

  const addCustomShift = () => {
    if (!customShift.name || !customShift.startTime || !customShift.endTime) {
      setError('Please fill in all shift details');
      return;
    }

    const newShift = {
      id: Date.now().toString(),
      ...customShift,
      isActive: true
    };

    setShiftConfig(prev => ({
      ...prev,
      shifts: [...prev.shifts, newShift]
    }));

    setCustomShift({
      name: '',
      startTime: '',
      endTime: ''
    });

    logger.success('Custom shift added', { shift: newShift });
  };

  const removeRoom = (id: string) => {
    setRooms(rooms.filter(room => room.id !== id));
    logger.action('remove_room', 'RoomSetup', { roomId: id });
  };

  const removeShift = (id: string) => {
    setShiftConfig(prev => ({
      ...prev,
      shifts: prev.shifts.filter(shift => shift.id !== id)
    }));
    logger.action('remove_shift', 'RoomSetup', { shiftId: id });
  };

  const handleSubmit = async () => {
    if (isSubmitting || rooms.length === 0) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Save all rooms
      rooms.forEach(room => roomStorage.add(room));

      // Save shift configuration
      localStorage.setItem('shiftConfig', JSON.stringify(shiftConfig));

      // Update onboarding progress
      onboardingStorage.setProgress('rooms_complete');

      logger.success('Room setup completed', { 
        roomCount: rooms.length,
        shiftConfig 
      });

      onComplete();
    } catch (err: any) {
      console.error('Error saving rooms:', err);
      setError(err.message);
      logger.error('Failed to save rooms', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Room Setup</h2>
      <p className="text-gray-600 mb-8">
        Add the rooms in your hotel and configure your shift schedule
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Shift Configuration */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Shift Configuration</h3>
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setShiftConfig(prev => ({ ...prev, type: 'default' }))}
              className={`px-4 py-2 rounded-lg ${
                shiftConfig.type === 'default'
                  ? 'bg-[#0B4619] text-white'
                  : 'bg-white'
              }`}
            >
              Default Shifts
            </button>
            <button
              onClick={() => setShiftConfig(prev => ({ ...prev, type: 'custom' }))}
              className={`px-4 py-2 rounded-lg ${
                shiftConfig.type === 'custom'
                  ? 'bg-[#0B4619] text-white'
                  : 'bg-white'
              }`}
            >
              Custom Shifts
            </button>
          </div>

          {shiftConfig.type === 'custom' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  value={customShift.name}
                  onChange={(e) => setCustomShift(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Shift Name"
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="time"
                  value={customShift.startTime}
                  onChange={(e) => setCustomShift(prev => ({ ...prev, startTime: e.target.value }))}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="time"
                  value={customShift.endTime}
                  onChange={(e) => setCustomShift(prev => ({ ...prev, endTime: e.target.value }))}
                  className="px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                onClick={addCustomShift}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90"
              >
                <Plus className="w-5 h-5" />
                Add Shift
              </button>
            </div>
          )}

          <div className="space-y-2">
            {shiftConfig.shifts.map(shift => (
              <div
                key={shift.id}
                className="flex items-center justify-between bg-white p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{shift.name}</p>
                    <p className="text-sm text-gray-500">
                      {shift.startTime} - {shift.endTime}
                    </p>
                  </div>
                </div>
                {shiftConfig.type === 'custom' && (
                  <button
                    onClick={() => removeShift(shift.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Room Setup */}
      <form onSubmit={addRoom} className="mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <input
              type="number"
              value={currentRoom.floor}
              onChange={(e) => setCurrentRoom({ ...currentRoom, floor: e.target.value })}
              placeholder="Floor Number"
              required
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={currentRoom.type}
              onChange={(e) => setCurrentRoom({ ...currentRoom, type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="standard">Standard</option>
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Room
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-4 mb-8">
        {rooms.map(room => (
          <div
            key={room.id}
            className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
          >
            <div className="flex items-center">
              <DoorClosed className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <h3 className="font-medium">Room {room.number}</h3>
                <p className="text-sm text-gray-500">Floor {room.floor} • {room.type}</p>
              </div>
            </div>
            <button
              onClick={() => removeRoom(room.id)}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
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
          onClick={handleSubmit}
          disabled={isSubmitting || rooms.length === 0}
          className={`flex-1 flex items-center justify-center py-3 rounded-lg transition-colors ${
            isSubmitting || rooms.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </div>

      {rooms.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          Add at least one room to continue
        </div>
      )}
    </div>
  );
};

export default RoomSetup;