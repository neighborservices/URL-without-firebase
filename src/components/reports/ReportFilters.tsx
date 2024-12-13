import React from 'react';
import { Search } from 'lucide-react';
import type { Staff, Room } from '../../types';

interface ReportFiltersProps {
  filters: {
    startDate: string;
    endDate: string;
    staffIds: string[];
    roomIds: string[];
    shifts: string[];
  };
  onFilterChange: (name: string, value: any) => void;
  staff: Staff[];
  rooms: Room[];
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFilterChange,
  staff,
  rooms,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onFilterChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onFilterChange('endDate', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shifts
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.shifts.includes('Morning')}
                onChange={(e) => {
                  const shifts = e.target.checked
                    ? [...filters.shifts, 'Morning']
                    : filters.shifts.filter(s => s !== 'Morning');
                  onFilterChange('shifts', shifts);
                }}
                className="mr-2"
              />
              Morning
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.shifts.includes('Evening')}
                onChange={(e) => {
                  const shifts = e.target.checked
                    ? [...filters.shifts, 'Evening']
                    : filters.shifts.filter(s => s !== 'Evening');
                  onFilterChange('shifts', shifts);
                }}
                className="mr-2"
              />
              Evening
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Staff Members
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {staff.map(member => (
              <label key={member.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.staffIds.includes(member.id)}
                  onChange={(e) => {
                    const staffIds = e.target.checked
                      ? [...filters.staffIds, member.id]
                      : filters.staffIds.filter(id => id !== member.id);
                    onFilterChange('staffIds', staffIds);
                  }}
                  className="mr-2"
                />
                {member.name} ({member.staffId})
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rooms
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {rooms.map(room => (
              <label key={room.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.roomIds.includes(room.id)}
                  onChange={(e) => {
                    const roomIds = e.target.checked
                      ? [...filters.roomIds, room.id]
                      : filters.roomIds.filter(id => id !== room.id);
                    onFilterChange('roomIds', roomIds);
                  }}
                  className="mr-2"
                />
                Room {room.number}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;