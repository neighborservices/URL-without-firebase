import React from 'react';
import { Clock, User, DollarSign, Building2 } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'user',
    message: 'New staff member added at Grand Hotel',
    time: '5 minutes ago',
    icon: User,
  },
  {
    id: 2,
    type: 'tip',
    message: 'Large tip ($500) received at Luxury Suites',
    time: '15 minutes ago',
    icon: DollarSign,
  },
  {
    id: 3,
    type: 'hotel',
    message: 'New hotel registration: Seaside Resort',
    time: '1 hour ago',
    icon: Building2,
  },
];

const RecentActivity = () => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg">
          <div className="p-2 bg-gray-100 rounded-full">
            <activity.icon className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="text-gray-800">{activity.message}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{activity.time}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;