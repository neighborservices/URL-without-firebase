import { format, startOfDay, endOfDay, parseISO } from 'date-fns';

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatTime = (dateString: string) => {
  try {
    return format(new Date(dateString), 'HH:mm');
  } catch (error) {
    return '--:--';
  }
};

export const isWithinDateRange = (dateString: string, startDate: string, endDate: string) => {
  try {
    const date = new Date(dateString);
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));
    return date >= start && date <= end;
  } catch (error) {
    return false;
  }
};