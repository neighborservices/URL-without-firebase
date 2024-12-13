import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, DoorClosed, AlertCircle, Search, Loader2, ArrowLeft, Trash2, Ban, CheckCircle, BarChart3, DollarSign, Lock, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

interface Hotel {
  id: string;
  hotelName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
  onboardingComplete: boolean;
  bankAccountAdded: boolean;
  roomsAdded: boolean;
  staffAdded: boolean;
  status: 'pending' | 'active' | 'suspended' | 'deactivated';
  totalTips?: number;
  totalStaff?: number;
  totalRooms?: number;
}

interface HotelStats {
  totalHotels: number;
  activeHotels: number;
  totalTips: number;
  totalStaff: number;
  totalRooms: number;
  completedSetups: number;
  pendingApprovals: number;
}

const SuperAdmin = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [stats, setStats] = useState<HotelStats>({
    totalHotels: 0,
    activeHotels: 0,
    totalTips: 0,
    totalStaff: 0,
    totalRooms: 0,
    completedSetups: 0,
    pendingApprovals: 0
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'suspended' | 'deactivated'>('all');

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = () => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const hotelData = users.map((user: any) => {
        const hotelInfo = JSON.parse(localStorage.getItem(`hotel_${user.id}`) || '{}');
        const staff = JSON.parse(localStorage.getItem(`staff_${user.id}`) || '[]');
        const rooms = JSON.parse(localStorage.getItem(`rooms_${user.id}`) || '[]');
        const tips = JSON.parse(localStorage.getItem(`tips_${user.id}`) || '[]');
        
        return {
          id: user.id,
          ...hotelInfo,
          email: user.email,
          createdAt: user.createdAt,
          status: hotelInfo.status || 'pending',
          totalTips: tips.reduce((sum: number, tip: any) => sum + tip.amount, 0),
          totalStaff: staff.length,
          totalRooms: rooms.length
        };
      });

      setHotels(hotelData);
      
      // Calculate stats
      const newStats = {
        totalHotels: hotelData.length,
        activeHotels: hotelData.filter(h => h.status === 'active').length,
        totalTips: hotelData.reduce((sum, h) => sum + (h.totalTips || 0), 0),
        totalStaff: hotelData.reduce((sum, h) => sum + (h.totalStaff || 0), 0),
        totalRooms: hotelData.reduce((sum, h) => sum + (h.totalRooms || 0), 0),
        completedSetups: hotelData.filter(h => h.onboardingComplete).length,
        pendingApprovals: hotelData.filter(h => h.status === 'pending').length
      };
      setStats(newStats);

    } catch (err: any) {
      setError('Failed to load hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (hotelId: string, newStatus: 'pending' | 'active' | 'suspended' | 'deactivated') => {
    try {
      const updatedHotels = hotels.map(hotel => 
        hotel.id === hotelId ? { ...hotel, status: newStatus } : hotel
      );
      
      // Update local storage
      const hotelData = JSON.parse(localStorage.getItem(`hotel_${hotelId}`) || '{}');
      localStorage.setItem(`hotel_${hotelId}`, JSON.stringify({
        ...hotelData,
        status: newStatus
      }));

      setHotels(updatedHotels);
      loadHotels(); // Refresh stats
    } catch (err) {
      setError('Failed to update hotel status');
    }
  };

  const handleResetPassword = async (hotelId: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map((user: any) => {
        if (user.id === hotelId) {
          return { ...user, password: 'newpassword123' }; // In a real app, generate secure password
        }
        return user;
      });
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // In a real app, send email to user with new password
      alert(`Password reset successful. New password: newpassword123`);
      setShowResetModal(false);
    } catch (err) {
      setError('Failed to reset password');
    }
  };

  const handleDeleteHotel = async (hotelId: string) => {
    if (!window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
      return;
    }

    try {
      // Remove all hotel data from local storage
      localStorage.removeItem(`hotel_${hotelId}`);
      localStorage.removeItem(`staff_${hotelId}`);
      localStorage.removeItem(`rooms_${hotelId}`);
      localStorage.removeItem(`tips_${hotelId}`);
      localStorage.removeItem(`assignments_${hotelId}`);

      // Update users list
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.filter((user: any) => user.id !== hotelId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Update state
      setHotels(hotels.filter(hotel => hotel.id !== hotelId));
      loadHotels(); // Refresh stats
    } catch (err) {
      setError('Failed to delete hotel');
    }
  };

  const filteredHotels = hotels.filter(hotel =>
    (filterStatus === 'all' || hotel.status === filterStatus) &&
    (hotel.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: boolean) => 
    status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

  const getHotelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'deactivated': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B4619]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <button
        onClick={() => navigate('/signin')}
        className="flex items-center text-[#0B4619] hover:text-[#0B4619]/90 mb-8"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Sign In
      </button>

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-xl text-gray-500 mt-2">Manage all registered hotels</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Hotels</p>
                <h3 className="text-2xl font-bold">{stats.totalHotels}</h3>
              </div>
              <Building2 className="w-8 h-8 text-[#0B4619]" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.activeHotels} active hotels
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Pending Approvals</p>
                <h3 className="text-2xl font-bold">{stats.pendingApprovals}</h3>
              </div>
              <UserCheck className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              New registrations
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Staff</p>
                <h3 className="text-2xl font-bold">{stats.totalStaff}</h3>
              </div>
              <Users className="w-8 h-8 text-[#0B4619]" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Active staff members
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Setup Complete</p>
                <h3 className="text-2xl font-bold">{stats.completedSetups}</h3>
              </div>
              <CheckCircle className="w-8 h-8 text-[#0B4619]" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {((stats.completedSetups / stats.totalHotels) * 100).toFixed(1)}% completion rate
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="border rounded-lg px-4 py-2 text-lg"
            >
              <option value="all">All Hotels</option>
              <option value="pending">Pending Approval</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search hotels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64 text-lg"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHotels.map(hotel => (
            <div
              key={hotel.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{hotel.hotelName}</h2>
                  <p className="text-gray-500">{hotel.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${getHotelStatusColor(hotel.status)}`}>
                    {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    {hotel.address}, {hotel.city}, {hotel.state} {hotel.zipCode}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className={`px-3 py-2 rounded-lg ${getStatusColor(hotel.bankAccountAdded)}`}>
                    <span className="text-sm">Bank Account</span>
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${getStatusColor(hotel.roomsAdded)}`}>
                    <span className="text-sm">Rooms Added</span>
                  </div>
                  <div className={`px-3 py-2 rounded-lg ${getStatusColor(hotel.staffAdded)}`}>
                    <span className="text-sm">Staff Added</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Created: {format(new Date(hotel.createdAt), 'MMM d, yyyy')}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <DoorClosed className="w-4 h-4" />
                      <span>{hotel.totalRooms || 0} Rooms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{hotel.totalStaff || 0} Staff</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${hotel.totalTips?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  {hotel.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(hotel.id, 'active')}
                      className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <UserCheck className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  
                  {hotel.status === 'active' ? (
                    <button
                      onClick={() => handleStatusChange(hotel.id, 'suspended')}
                      className="flex items-center gap-1 px-3 py-1 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                    >
                      <Ban className="w-4 h-4" />
                      Suspend
                    </button>
                  ) : hotel.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusChange(hotel.id, 'active')}
                      className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Activate
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setShowResetModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Lock className="w-4 h-4" />
                    Reset Password
                  </button>

                  <button
                    onClick={() => handleDeleteHotel(hotel.id)}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredHotels.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hotels Found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try a different search term' : 'No hotels have been registered yet'}
            </p>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {showResetModal && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Reset Password</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reset the password for {selectedHotel.hotelName}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetPassword(selectedHotel.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;