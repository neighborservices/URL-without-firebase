import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change: string;
  color: string;
}

const StatsCard = ({ title, value, icon: Icon, change, color }: StatsCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <p className={`text-sm mt-2 ${
        change.startsWith('+') ? 'text-green-600' : 'text-red-600'
      }`}>
        {change} from last month
      </p>
    </div>
  );
};

export default StatsCard;