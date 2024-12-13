export interface ShiftConfig {
  type: 'default' | 'custom';
  shifts: Shift[];
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Staff {
  id: string;
  staffId: string;
  name: string;
  role: string;
  image?: string;
  email: string;
  phone: string;
  shift: string;
}

export interface Assignment {
  id: string;
  staffId: string;
  roomId: string;
  shift: string;
  status: 'active' | 'completed';
  startTime: string;
  endTime: string;
}

export interface Room {
  id: string;
  number: string;
  floor: string;
  type: string;
  assignedStaff: string[];
}

export interface Hotel {
  id: string;
  hotelName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  shiftConfig: ShiftConfig;
  bankAccountAdded: boolean;
  roomsAdded: boolean;
  staffAdded: boolean;
}