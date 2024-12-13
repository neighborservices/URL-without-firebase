import React from 'react';
import { Download } from 'lucide-react';
import type { Assignment, Staff, Room } from '../../types';
import { formatDate, formatTime } from '../../lib/utils/dateUtils';

interface ReportDownloadProps {
  assignments: Assignment[];
  staff: Staff[];
  rooms: Room[];
  onDownload: () => void;
}

const ReportDownload: React.FC<ReportDownloadProps> = ({
  assignments,
  staff,
  rooms,
  onDownload,
}) => {
  return (
    <div className="border-t pt-6">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-gray-600">
            {assignments.length} assignments found
          </span>
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-6 py-3 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90"
        >
          <Download className="w-5 h-5" />
          Download Report
        </button>
      </div>
    </div>
  );
};

export default ReportDownload;