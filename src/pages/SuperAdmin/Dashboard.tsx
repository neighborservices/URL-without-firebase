import React from 'react';
import { Building2, Users, DollarSign, CheckCircle, BarChart3, MessageCircle, Settings, Activity } from 'lucide-react';
import StatsCard from './components/StatsCard';
import TrendChart from './components/TrendChart';
import RecentActivity from './components/RecentActivity';
import PendingActions from './components/PendingActions';

const Dashboard = () => {
  const stats = [
    { title: 'Total Hotels', value: '24', icon: Building2, change: '+12%', color: 'text-[#0B4619]' },
    { title: 'Active Staff', value: '142', icon: Users, change: '+8%', color: 'text-blue-600' },
    { title: 'Total Tips', value: '$45,250', icon: DollarSign, change: '+15%', color: 'text-green-600' },
    { title: 'Completion Rate', value: '94%', icon: CheckCircle, change: '+2%', color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Tipping Trends</h3>
            <select className="border rounded-lg px-3 py-1 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <TrendChart />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Staff Performance</h3>
            <select className="border rounded-lg px-3 py-1 text-sm">
              <option>Top Performers</option>
              <option>Most Active</option>
              <option>New Staff</option>
            </select>
          </div>
          <TrendChart />
        </div>
      </div>

      {/* Activity and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
          <RecentActivity />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-6">Pending Actions</h3>
          <PendingActions />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-[#0B4619]" />
          <span className="font-medium">Send Announcement</span>
        </button>

        <button className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <Settings className="w-5 h-5 text-[#0B4619]" />
          <span className="font-medium">Platform Settings</span>
        </button>

        <button className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#0B4619]" />
          <span className="font-medium">View Audit Logs</span>
        </button>

        <button className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-[#0B4619]" />
          <span className="font-medium">Analytics</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;