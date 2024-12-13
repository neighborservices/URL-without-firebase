import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Users, Calendar, Search, Plus, Loader2, AlertCircle, DoorClosed, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useRooms } from '../hooks/useRooms';
import { useAssignments } from '../hooks/useAssignments';
import LoadingScreen from '../components/LoadingScreen';
import AddStaffModal from '../components/AddStaffModal';
import RoomAssignmentDetails from '../components/RoomAssignmentDetails';
import { logger } from '../lib/logger';
import StaffList from '../components/staff/StaffList';
import StaffSearch from '../components/staff/StaffSearch';

const StaffAssignment = () => {
  const { staff, loading: staffLoading, error: staffError, createStaff, reloadStaff } = useStaff();
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const { createAssignment, getAssignmentsForRoom } = useAssignments();
  
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedShift, setSelectedShift] = useState<'Morning' | 'Evening'>('Morning');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Reload staff list to ensure it's up to date
    reloadStaff();
  }, []);

  if (staffLoading || roomsLoading) {
    return <LoadingScreen />;
  }

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.staffId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(prev =>
      prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
    );
    logger.action('select_staff', 'StaffAssignment', { staffId });
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRooms(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
    logger.action('select_room', 'StaffAssignment', { roomId });
  };

  const handleRoomExpand = (roomId: string) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  const handleAssign = async () => {
    if (selectedStaff.length === 0 || selectedRooms.length === 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create assignments for each staff-room combination
      for (const staffId of selectedStaff) {
        for (const roomId of selectedRooms) {
          try {
            await createAssignment(staffId, roomId, selectedShift);
            setAssignmentStatus(prev => ({
              ...prev,
              [roomId]: `Staff assigned successfully`
            }));
            logger.success('Assignment created', { staffId, roomId, shift: selectedShift });
          } catch (err: any) {
            setAssignmentStatus(prev => ({
              ...prev,
              [roomId]: err.message || 'Assignment failed'
            }));
            logger.error('Assignment failed', err);
          }
        }
      }

      // Clear selections after successful assignment
      setSelectedStaff([]);
      setSelectedRooms([]);

      // Clear status messages after 3 seconds
      setTimeout(() => {
        setAssignmentStatus({});
      }, 3000);
    } catch (err) {
      logger.error('Error creating assignments:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStaff = async (staffData: any) => {
    try {
      setIsSubmitting(true);
      const result = await createStaff(staffData);
      if (result.success) {
        setShowAddStaffModal(false);
        // Force reload staff list
        reloadStaff();
        logger.success('Staff member added', { staffId: result.staffId });
      }
    } catch (err) {
      logger.error('Error adding staff:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAssignedStaffForRoom = (roomId: string) => {
    const assignments = getAssignmentsForRoom(roomId);
    return staff.filter(member => 
      assignments.some(assignment => assignment.staffId === member.id)
    );
  };

  return (
    <div className="p-8">
      {/* Header section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Assignment</h1>
          <p className="text-gray-500 mt-1">Select staff and rooms to create assignments</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#B4F481] rounded-full p-2">
            <Calendar className="w-5 h-5 text-[#0B4619]" />
          </div>
          <span className="text-gray-600">{format(new Date(), 'EEEE, dd MMM yyyy')}</span>
        </div>
      </div>

      {/* Error messages */}
      {(staffError || roomsError) && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{staffError || roomsError}</span>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-2 gap-8">
        {/* Staff Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Select Staff</h2>
            <StaffSearch 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAddStaff={() => setShowAddStaffModal(true)}
            />
          </div>

          <StaffList 
            staff={filteredStaff}
            selectedStaff={selectedStaff}
            onStaffSelect={handleStaffSelect}
          />
        </div>

        {/* Room Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Select Rooms</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value as 'Morning' | 'Evening')}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="Morning">Morning Shift (6:00 - 14:00)</option>
                  <option value="Evening">Evening Shift (14:00 - 22:00)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {rooms.map(room => {
              const assignedStaff = getAssignedStaffForRoom(room.id);
              const isExpanded = expandedRoom === room.id;

              return (
                <div key={room.id} className="bg-white border rounded-lg">
                  <div
                    onClick={() => handleRoomSelect(room.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedRooms.includes(room.id)
                        ? 'bg-[#B4F481] border-2 border-[#0B4619]'
                        : 'hover:border-[#0B4619]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Room {room.number}</h3>
                        <p className="text-sm text-gray-500">Floor {room.floor}</p>
                        {assignmentStatus[room.id] && (
                          <p className="text-sm text-green-600 mt-1">
                            {assignmentStatus[room.id]}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {assignedStaff.length > 0 && (
                          <div className="flex -space-x-2">
                            {assignedStaff.slice(0, 3).map((member) => (
                              <div
                                key={member.id}
                                className="w-8 h-8 rounded-full bg-[#B4F481] border-2 border-white flex items-center justify-center"
                              >
                                <span className="text-sm font-medium text-[#0B4619]">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                            ))}
                            {assignedStaff.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                                <span className="text-sm text-gray-600">
                                  +{assignedStaff.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoomExpand(room.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <RoomAssignmentDetails
                      room={room}
                      assignedStaff={assignedStaff}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleAssign}
          disabled={isSubmitting || selectedStaff.length === 0 || selectedRooms.length === 0}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
            isSubmitting || selectedStaff.length === 0 || selectedRooms.length === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#0B4619] text-white hover:bg-[#0B4619]/90'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Assignments...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Assignment
            </>
          )}
        </button>
      </div>

      {/* Modals */}
      {showAddStaffModal && (
        <AddStaffModal
          onClose={() => setShowAddStaffModal(false)}
          onSubmit={handleAddStaff}
          isSubmitting={isSubmitting}
          currentStaffCount={staff.length}
        />
      )}
    </div>
  );
};

export default StaffAssignment;