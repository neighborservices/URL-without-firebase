import { useState, useEffect } from 'react';
import { format, startOfDay } from 'date-fns';
import { logger } from '../lib/logger';
import { checkExistingAssignment } from '../lib/utils/assignmentUtils';
import type { Assignment } from '../types';

export function useAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');
      setAssignments(storedAssignments);
      logger.info('Loaded assignments', { count: storedAssignments.length });
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to load assignments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAssignment = async (staffId: string, roomId: string, shift: string) => {
    try {
      setError(null);
      
      // Check for existing assignment
      if (checkExistingAssignment(assignments, staffId, roomId, shift)) {
        throw new Error('Staff member is already assigned to this room for this shift');
      }

      const today = startOfDay(new Date());
      let startTime: Date;
      let endTime: Date;

      if (shift === 'Morning') {
        startTime = new Date(today.setHours(6, 0, 0, 0));
        endTime = new Date(today.setHours(14, 0, 0, 0));
      } else {
        startTime = new Date(today.setHours(14, 0, 0, 0));
        endTime = new Date(today.setHours(22, 0, 0, 0));
      }

      const newAssignment: Assignment = {
        id: Date.now().toString(),
        staffId,
        roomId,
        shift,
        status: 'active',
        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      };

      const updatedAssignments = [...assignments, newAssignment];
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
      setAssignments(updatedAssignments);
      
      logger.success('Created new assignment', { assignment: newAssignment });
      return { success: true, assignmentId: newAssignment.id };
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to create assignment', err);
      return { success: false, error: err.message };
    }
  };

  const getAssignmentsForRoom = (roomId: string) => {
    return assignments.filter(assignment => assignment.roomId === roomId);
  };

  const getCurrentAssignmentForRoom = (roomId: string) => {
    const now = new Date();
    return assignments.find(assignment => 
      assignment.roomId === roomId &&
      assignment.status === 'active' &&
      new Date(assignment.startTime) <= now &&
      new Date(assignment.endTime) >= now
    );
  };

  const updateAssignment = async (assignmentId: string, updates: Partial<Assignment>) => {
    try {
      setError(null);
      const updatedAssignments = assignments.map(assignment => 
        assignment.id === assignmentId ? { ...assignment, ...updates } : assignment
      );
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
      setAssignments(updatedAssignments);
      logger.success('Updated assignment', { assignmentId, updates });
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to update assignment', err);
      return { success: false, error: err.message };
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    try {
      setError(null);
      const updatedAssignments = assignments.filter(assignment => assignment.id !== assignmentId);
      localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
      setAssignments(updatedAssignments);
      logger.success('Deleted assignment', { assignmentId });
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to delete assignment', err);
      return { success: false, error: err.message };
    }
  };

  return {
    assignments,
    loading,
    error,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentsForRoom,
    getCurrentAssignmentForRoom
  };
}