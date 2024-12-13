import React, { useState } from 'react';
import { Plus, Trash2, Save, AlertCircle, Clock } from 'lucide-react';
import { useShiftManagement } from '../hooks/useShiftManagement';
import type { Shift } from '../types';
import { logger } from '../lib/logger';

interface ShiftManagementProps {
  onSave: () => void;
}

const ShiftManagement: React.FC<ShiftManagementProps> = ({ onSave }) => {
  const { shiftConfig, updateShiftConfig, addCustomShift, removeShift, error: hookError } = useShiftManagement();
  const [error, setError] = useState<string | null>(null);
  const [newShift, setNewShift] = useState({
    name: '',
    startTime: '',
    endTime: ''
  });

  const handleShiftTypeChange = (type: 'default' | 'custom') => {
    setError(null);
    updateShiftConfig({
      type,
      shifts: type === 'default' ? [] : shiftConfig.shifts
    });
    logger.action('change_shift_type', 'ShiftManagement', { type });
  };

  const handleAddShift = () => {
    if (!newShift.name || !newShift.startTime || !newShift.endTime) {
      setError('Please fill in all shift details');
      return;
    }

    addCustomShift(newShift);
    setNewShift({ name: '', startTime: '', endTime: '' });
    setError(null);
  };

  const handleSave = async () => {
    try {
      if (shiftConfig.type === 'custom' && shiftConfig.shifts.length === 0) {
        throw new Error('Please add at least one shift');
      }

      await updateShiftConfig(shiftConfig);
      onSave();
      logger.success('Shift configuration saved');
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to save shift configuration', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Shift Configuration</h2>
        <div className="flex gap-4">
          <button
            onClick={() => handleShiftTypeChange('default')}
            className={`px-4 py-2 rounded-lg ${
              shiftConfig.type === 'default'
                ? 'bg-[#0B4619] text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Default Shifts
          </button>
          <button
            onClick={() => handleShiftTypeChange('custom')}
            className={`px-4 py-2 rounded-lg ${
              shiftConfig.type === 'custom'
                ? 'bg-[#0B4619] text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Custom Shifts
          </button>
        </div>
      </div>

      {(error || hookError) && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error || hookError}</span>
        </div>
      )}

      <div className="space-y-4">
        {shiftConfig.shifts.map(shift => (
          <div
            key={shift.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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

      {shiftConfig.type === 'custom' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              value={newShift.name}
              onChange={(e) => setNewShift(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Shift Name"
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="time"
              value={newShift.startTime}
              onChange={(e) => setNewShift(prev => ({ ...prev, startTime: e.target.value }))}
              className="px-4 py-2 border rounded-lg"
            />
            <input
              type="time"
              value={newShift.endTime}
              onChange={(e) => setNewShift(prev => ({ ...prev, endTime: e.target.value }))}
              className="px-4 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handleAddShift}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90"
          >
            <Plus className="w-5 h-5" />
            Add Shift
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90"
        >
          <Save className="w-5 h-5" />
          Save Configuration
        </button>
      </div>
    </div>
  );
};

export default ShiftManagement;