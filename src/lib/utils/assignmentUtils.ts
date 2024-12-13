import { Assignment } from '../../types';
import { logger } from '../logger';

export const checkExistingAssignment = (
  assignments: Assignment[],
  staffId: string,
  roomId: string,
  shift: string
): boolean => {
  const existingAssignment = assignments.find(
    a => a.staffId === staffId && 
        a.roomId === roomId && 
        a.shift === shift &&
        a.status === 'active'
  );

  if (existingAssignment) {
    logger.warning('Duplicate assignment attempt', {
      staffId,
      roomId,
      shift
    });
    return true;
  }

  return false;
};