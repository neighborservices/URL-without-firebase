import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const actions = [
  {
    id: 1,
    title: 'Hotel Registration Approval',
    description: 'Seaside Resort pending approval',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Staff Verification',
    description: '3 new staff members need verification',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Payment Issue',
    description: 'Failed transaction at Grand Hotel',
    priority: 'high',
  },
];

const PendingActions = () => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <div key={action.id} className="flex items-start gap-4 p-4 border rounded-lg">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
            action.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <div className="flex-1">
            <h4 className="font-medium">{action.title}</h4>
            <p className="text-sm text-gray-500">{action.description}</p>
          </div>
          <div className="flex gap-2">
            <button className="p-1 text-green-600 hover:bg-green-50 rounded">
              <CheckCircle className="w-5 h-5" />
            </button>
            <button className="p-1 text-red-600 hover:bg-red-50 rounded">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingActions;