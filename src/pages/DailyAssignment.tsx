import React, { useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar, Search, Users, DoorClosed, Clock, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useRooms } from '../hooks/useRooms';
import { useAssignments } from '../hooks/useAssignments';
import LoadingScreen from '../components/LoadingScreen';
import EditAssignmentModal from '../components/EditAssignmentModal';

const DailyAssignment = () => {
  const { staff, loading: staffLoading } = useStaff();
  const { rooms, loading: roomsLoading } = useRooms();
  const { assignments, loading: assignmentsLoading, deleteAssignment, error } = useAssignments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState('All Shifts');
  const [currentTime] = useState(new Date());
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);

  if (staffLoading || roomsLoading || assignmentsLoading) {
    return <LoadingScreen />;
  }

  const getCurrentShift = () => {
    const hour = currentTime.getHours();
    return hour >= 6 && hour < 14 ? 'Morning' : hour >= 14 && hour < 22 ? 'Evening' : 'Off';
  };

  const getAssignmentStatus = (assignment: any) => {
    try {
      const now = currentTime;
      const startTime = parseISO(assignment.startTime);
      const endTime = parseISO(assignment.endTime);

      if (!isValid(startTime) || !isValid(endTime)) {
        return 'Unknown';
      }

      if (now < startTime) return 'Upcoming';
      if (now > endTime) return 'Completed';
      return 'Active';
    } catch (err) {
      return 'Unknown';
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      setIsDeleting(assignmentId);
      await deleteAssignment(assignmentId);
    } catch (err) {
      console.error('Error deleting assignment:', err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditAssignment = (assignment: any) => {
    setEditingAssignment(assignment);
  };

  const handleCloseEdit = () => {
    setEditingAssignment(null);
  };

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return '--:--';
      }
      return format(date, 'HH:mm');
    } catch (err) {
      return '--:--';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const staffMember = staff.find(s => s.id === assignment.staffId);
    if (!staffMember) return false;

    const matchesSearch = staffMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staffMember.staffId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesShift = selectedShift === 'All Shifts' || assignment.shift === selectedShift;

    return matchesSearch && matchesShift;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Daily Assignments</h1>
          <p className="text-gray-500 mt-1">Current shift: {getCurrentShift()}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#B4F481] rounded-full p-2">
            <Calendar className="w-5 h-5 text-[#0B4619]" />
          </div>
          <span className="text-gray-600">{format(currentTime, 'EEEE, dd MMM yyyy HH:mm')}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Today's Assignments</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by name or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 text-lg"
                />
              </div>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="border rounded-lg px-4 py-2 text-lg"
              >
                <option>All Shifts</option>
                <option>Morning</option>
                <option>Evening</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try a different search term' : 'No staff assignments for the selected criteria'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map(assignment => {
                const staffMember = staff.find(s => s.id === assignment.staffId);
                const room = rooms.find(r => r.id === assignment.roomId);
                const status = getAssignmentStatus(assignment);

                if (!staffMember || !room) return null;

                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {staffMember.image ? (
                        <img
                          src={staffMember.image}
                          alt={staffMember.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-lg">
                            {staffMember.name.charAt(0)}
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 text-lg">{staffMember.name}</h3>
                          <span className="text-sm text-gray-500">({staffMember.staffId})</span>
                        </div>
                        <p className="text-sm text-gray-500">{staffMember.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <DoorClosed className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 text-lg">Room {room.number}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600 text-lg">
                          {formatTime(assignment.startTime)} - {formatTime(assignment.endTime)}
                        </span>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-sm ${
                        status === 'Active' ? 'bg-green-100 text-green-800' :
                        status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {status}
                      </span>

                      <span className="px-3 py-1 rounded-full text-sm bg-[#B4F481] text-[#0B4619]">
                        {assignment.shift}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          disabled={isDeleting === assignment.id}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditAssignment(assignment)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editingAssignment && (
        <EditAssignmentModal
          assignment={editingAssignment}
          staff={staff}
          rooms={rooms}
          onClose={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default DailyAssignment;