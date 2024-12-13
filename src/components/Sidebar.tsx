import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, DoorClosed, Calendar, CreditCard, FileText, LogOut } from 'lucide-react';
import { useHotel } from '../contexts/HotelContext';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { hotelData } = useHotel();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const navItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/' },
    { icon: Users, text: 'Staff Assignment', path: '/staff-assignment' },
    { icon: Calendar, text: 'Daily Assignment', path: '/daily-assignment' },
    { icon: DoorClosed, text: 'Rooms', path: '/rooms' },
    { icon: CreditCard, text: 'Account / Cards', path: '/account' },
    { icon: FileText, text: 'Reports', path: '/reports' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white h-screen w-64 fixed left-0 top-0 shadow-lg flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#0B4619]">
          {hotelData?.hotelName || 'TipCard'}
        </h1>
      </div>
      <nav className="flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-[#B4F481]/30 hover:text-[#0B4619] transition-colors ${
                isActive ? 'bg-[#B4F481]/30 text-[#0B4619]' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{item.text}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;