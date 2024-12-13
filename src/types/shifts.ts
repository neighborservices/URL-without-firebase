export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ShiftConfig {
  type: 'default' | 'custom';
  shifts: Shift[];
}

export const DEFAULT_SHIFTS: Shift[] = [
  {
    id: 'morning',
    name: 'Morning',
    startTime: '06:00',
    endTime: '14:00',
    isActive: true
  },
  {
    id: 'evening',
    name: 'Evening',
    startTime: '14:00',
    endTime: '22:00',
    isActive: true
  }
];