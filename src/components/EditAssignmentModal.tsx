import React, { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useAssignments } from '../hooks/useAssignments';
import type { Staff, Room } from '../types';

interface EditAssignmentModalProps {
  assignment: any;
  staff: Staff[];
  rooms: Room[];
  onClose: () => void;
}

const EditAssignmentModal = ({ assignment, staff, rooms, onClose }: EditAssignmentModalProps) => {
  const { updateAssignment } = useAssignments();
  const [formData, setFormData] = useState({
    staffId: assignment.staffId,
    roomId: assignment.roomId,
    shift: assignment.shift
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await updateAssignment(assignment.id, formData);
      onClose();
    } catch (err: any) {
      console.error('Error updating assignment:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Assignment</h2>
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
              Staff Member
            </label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.staffId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  Room {room.number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shift
            </label>
            <select
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value as 'Morning' | 'Evening' })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="Morning">Morning (6:00 - 14:00)</option>
              <option value="Evening">Evening (14:00 - 22:00)</option>
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
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Assignment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssignmentModal;