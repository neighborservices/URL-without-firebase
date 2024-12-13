import React from 'react';
import { Search, Plus } from 'lucide-react';

interface StaffSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddStaff: () => void;
}

const StaffSearch = ({ searchTerm, onSearchChange, onAddStaff }: StaffSearchProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search staff by name or ID"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-lg w-64"
        />
      </div>
      <button
        onClick={onAddStaff}
        className="flex items-center gap-2 px-4 py-2 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90"
      >
        <Plus className="w-5 h-5" />
        Add Staff
      </button>
    </div>
  );
};

export default StaffSearch;