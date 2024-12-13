import React, { useState } from 'react';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useRooms } from '../hooks/useRooms';
import { useAssignments } from '../hooks/useAssignments';
import LoadingScreen from '../components/LoadingScreen';
import ReportFilters from '../components/reports/ReportFilters';
import ReportDownload from '../components/reports/ReportDownload';
import { isWithinDateRange, formatDate, formatTime } from '../lib/utils/dateUtils';
import { logger } from '../lib/logger';

const Reports = () => {
  const { staff, loading: staffLoading } = useStaff();
  const { rooms, loading: roomsLoading } = useRooms();
  const { assignments, loading: assignmentsLoading } = useAssignments();
  
  const [filters, setFilters] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    staffIds: [] as string[],
    roomIds: [] as string[],
    shifts: [] as string[]
  });

  if (staffLoading || roomsLoading || assignmentsLoading) {
    return <LoadingScreen />;
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesDateRange = isWithinDateRange(
      assignment.startTime,
      filters.startDate,
      filters.endDate
    );
    const matchesStaff = filters.staffIds.length === 0 || filters.staffIds.includes(assignment.staffId);
    const matchesRoom = filters.roomIds.length === 0 || filters.roomIds.includes(assignment.roomId);
    const matchesShift = filters.shifts.length === 0 || filters.shifts.includes(assignment.shift);

    return matchesDateRange && matchesStaff && matchesRoom && matchesShift;
  });

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    logger.action('update_report_filter', 'Reports', { filter: name, value });
  };

  const generateReport = () => {
    try {
      logger.action('generate_report', 'Reports', { 
        assignmentCount: filteredAssignments.length 
      });

      const reportData = filteredAssignments.map(assignment => {
        const staffMember = staff.find(s => s.id === assignment.staffId);
        const room = rooms.find(r => r.id === assignment.roomId);

        return {
          date: formatDate(assignment.startTime),
          staffName: staffMember?.name || 'Unknown',
          staffId: staffMember?.staffId || 'N/A',
          roomNumber: room?.number || 'Unknown',
          shift: assignment.shift,
          startTime: formatTime(assignment.startTime),
          endTime: formatTime(assignment.endTime),
          status: assignment.status
        };
      });

      // Create CSV content
      const headers = ['Date', 'Staff Name', 'Staff ID', 'Room Number', 'Shift', 'Start Time', 'End Time', 'Status'];
      const csvContent = [
        headers.join(','),
        ...reportData.map(row => Object.values(row).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assignments-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.success('Report generated and downloaded');
    } catch (error) {
      logger.error('Failed to generate report', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and download assignment reports</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          staff={staff}
          rooms={rooms}
        />

        <ReportDownload
          assignments={filteredAssignments}
          staff={staff}
          rooms={rooms}
          onDownload={generateReport}
        />
      </div>
    </div>
  );
};

export default Reports;