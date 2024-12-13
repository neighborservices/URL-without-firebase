import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, CreditCard, FileText, DoorClosed } from 'lucide-react';
import { format } from 'date-fns';
import { useHotel } from '../contexts/HotelContext';
import { useDashboardData } from '../hooks/useDashboardData';
import LoadingScreen from '../components/LoadingScreen';
import OnboardingChecklist from '../components/OnboardingChecklist';

const Dashboard = () => {
  const navigate = useNavigate();
  const { hotelData } = useHotel();
  const { staff, rooms, loading, error } = useDashboardData();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-600">Error loading dashboard data: {error}</p>
      </div>
    );
  }

  const quickActions = [
    { icon: Users, label: 'Staff Assignment', color: 'bg-[#0B4619]', path: '/staff-assignment' },
    { icon: Calendar, label: 'Daily Assignment', color: 'bg-[#B4F481]', path: '/daily-assignment' },
    { icon: DoorClosed, label: 'Manage Rooms', color: 'bg-[#B4F481]', path: '/rooms' },
    { icon: CreditCard, label: 'Account / Cards', color: 'bg-[#B4F481]', path: '/account' },
    { icon: FileText, label: 'Reports', color: 'bg-[#B4F481]', path: '/reports' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to {hotelData?.hotelName || 'Your Hotel'}
          </h1>
          <p className="text-xl text-gray-500">Here's what's happening at your hotel today</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#B4F481] rounded-full p-3">
            <Calendar className="w-6 h-6 text-[#0B4619]" />
          </div>
          <span className="text-lg text-gray-600">{format(new Date(), 'EEEE, dd MMM yyyy')}</span>
          <div className="flex flex-col items-end">
            <span className="text-base font-medium text-gray-900">{hotelData?.email}</span>
            <span className="text-base text-gray-500">{hotelData?.phone}</span>
          </div>
        </div>
      </div>

      <OnboardingChecklist 
        hotelData={hotelData} 
        staffCount={staff.length} 
        roomCount={rooms.length} 
      />

      <div className="grid grid-cols-5 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className={`${action.color} ${
              index === 0 ? 'text-white' : 'text-[#0B4619]'
            } p-6 rounded-lg flex flex-col items-center gap-3 hover:opacity-90 transition-opacity`}
          >
            <action.icon className="w-8 h-8" />
            <span className="text-lg font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;