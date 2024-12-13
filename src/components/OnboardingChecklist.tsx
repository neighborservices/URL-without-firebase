import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, DoorClosed, Users, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { Hotel } from '../types';

interface OnboardingChecklistProps {
  hotelData: Hotel | null;
  staffCount: number;
  roomCount: number;
}

const OnboardingChecklist = ({ hotelData, staffCount, roomCount }: OnboardingChecklistProps) => {
  const navigate = useNavigate();

  const steps = [
    {
      id: 'bank',
      title: 'Add Bank Account',
      description: 'Set up your bank account to receive tip payments',
      icon: Building2,
      path: '/onboarding/bank',
      completed: Boolean(hotelData?.bankAccountAdded)
    },
    {
      id: 'rooms',
      title: 'Add Rooms',
      description: 'Add your hotel rooms to the system',
      icon: DoorClosed,
      path: '/onboarding/rooms',
      completed: roomCount > 0 && Boolean(hotelData?.roomsAdded)
    },
    {
      id: 'staff',
      title: 'Add Staff',
      description: 'Add your staff members who will receive tips',
      icon: Users,
      path: '/onboarding/staff',
      completed: staffCount > 0 && Boolean(hotelData?.staffAdded)
    }
  ];

  const incompleteSteps = steps.filter(step => !step.completed);
  const allStepsCompleted = incompleteSteps.length === 0;

  const handleStepClick = (path: string) => {
    // Use replace: true to prevent back button from returning to the same page
    navigate(path, { replace: true });
  };

  if (allStepsCompleted) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm mb-8">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Complete Your Setup</h2>
            <p className="text-lg text-gray-500">
              Finish setting up your account to start receiving tips
            </p>
          </div>
          {incompleteSteps.length > 0 && (
            <div className="bg-yellow-50 px-4 py-2 rounded-full flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <span className="text-base font-medium text-yellow-600">
                {incompleteSteps.length} steps remaining
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-6 rounded-lg border ${
                step.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-[#0B4619] cursor-pointer'
              }`}
              onClick={() => !step.completed && handleStepClick(step.path)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${
                  step.completed ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <step.icon className={`w-8 h-8 ${
                    step.completed ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    {step.title}
                    {step.completed && (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                  </h3>
                  <p className="text-base text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
              {!step.completed && (
                <ArrowRight className="w-6 h-6 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingChecklist;