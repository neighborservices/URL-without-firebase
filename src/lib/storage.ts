// Helper function to get data from localStorage with type safety
function getStorageData<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Helper function to set data in localStorage
function setStorageData<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Hotel storage
export const hotelStorage = {
  getHotel: () => getStorageData('hotel', null),
  setHotel: (hotel: any) => setStorageData('hotel', hotel),
  updateHotel: (updates: any) => {
    const hotel = getStorageData('hotel', null);
    if (hotel) {
      setStorageData('hotel', { ...hotel, ...updates });
    }
  }
};

// Staff storage
export const staffStorage = {
  getAll: () => getStorageData('staff', []),
  add: (staff: any) => {
    const currentStaff = getStorageData('staff', []);
    setStorageData('staff', [...currentStaff, staff]);
    
    // Update onboarding progress
    const progress = getStorageData('onboardingProgress', {
      step: 'registration',
      completed: false,
      timestamp: new Date().toISOString(),
      completedSteps: {}
    });
    
    progress.completedSteps.staff = true;
    setStorageData('onboardingProgress', progress);
  },
  update: (staffId: string, updates: any) => {
    const currentStaff = getStorageData('staff', []);
    const updatedStaff = currentStaff.map(staff => 
      staff.id === staffId ? { ...staff, ...updates } : staff
    );
    setStorageData('staff', updatedStaff);
  },
  remove: (staffId: string) => {
    const currentStaff = getStorageData('staff', []);
    setStorageData('staff', currentStaff.filter(staff => staff.id !== staffId));
  }
};

// Room storage
export const roomStorage = {
  getAll: () => getStorageData('rooms', []),
  add: (room: any) => {
    const currentRooms = getStorageData('rooms', []);
    setStorageData('rooms', [...currentRooms, room]);
    
    // Update onboarding progress
    const progress = getStorageData('onboardingProgress', {
      step: 'registration',
      completed: false,
      timestamp: new Date().toISOString(),
      completedSteps: {}
    });
    
    progress.completedSteps.rooms = true;
    setStorageData('onboardingProgress', progress);
  },
  update: (roomId: string, updates: any) => {
    const currentRooms = getStorageData('rooms', []);
    const updatedRooms = currentRooms.map(room => 
      room.id === roomId ? { ...room, ...updates } : room
    );
    setStorageData('rooms', updatedRooms);
  },
  remove: (roomId: string) => {
    const currentRooms = getStorageData('rooms', []);
    setStorageData('rooms', currentRooms.filter(room => room.id !== roomId));
  }
};

// Assignment storage
export const assignmentStorage = {
  getAll: () => getStorageData('assignments', []),
  add: (assignment: any) => {
    const currentAssignments = getStorageData('assignments', []);
    setStorageData('assignments', [...currentAssignments, assignment]);
  },
  update: (assignmentId: string, updates: any) => {
    const currentAssignments = getStorageData('assignments', []);
    const updatedAssignments = currentAssignments.map(assignment => 
      assignment.id === assignmentId ? { ...assignment, ...updates } : assignment
    );
    setStorageData('assignments', updatedAssignments);
  },
  remove: (assignmentId: string) => {
    const currentAssignments = getStorageData('assignments', []);
    setStorageData('assignments', currentAssignments.filter(assignment => assignment.id !== assignmentId));
  }
};

// Onboarding progress storage
export const onboardingStorage = {
  getProgress: () => getStorageData('onboardingProgress', {
    step: 'registration',
    completed: false,
    timestamp: new Date().toISOString(),
    completedSteps: {}
  }),
  
  setProgress: (step: string) => {
    const current = getStorageData('onboardingProgress', {
      step: 'registration',
      completed: false,
      timestamp: new Date().toISOString(),
      completedSteps: {}
    });

    const updatedProgress = {
      ...current,
      step,
      completedSteps: {
        ...current.completedSteps,
        [step]: true
      },
      timestamp: new Date().toISOString()
    };

    setStorageData('onboardingProgress', updatedProgress);
  },

  complete: () => {
    const progress = {
      step: 'completed',
      completed: true,
      timestamp: new Date().toISOString(),
      completedSteps: {
        registration: true,
        bank: true,
        rooms: true,
        staff: true
      }
    };
    setStorageData('onboardingProgress', progress);
  },

  isStepComplete: (step: string) => {
    const progress = getStorageData('onboardingProgress', { completedSteps: {} });
    return Boolean(progress.completedSteps[step]);
  }
};