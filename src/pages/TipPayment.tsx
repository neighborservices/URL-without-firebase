import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, AlertCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../components/PaymentForm';
import { logger } from '../lib/logger';
import type { Room, Staff } from '../types';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PRESET_AMOUNTS = [10, 20, 30];
const EMOJIS = ['😊', '🙂', '😃', '😍'];

const TipPayment = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('50');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    loadRoomAndStaffDetails();
  }, [roomId]);

  const loadRoomAndStaffDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!roomId) {
        throw new Error('Room ID is required');
      }

      // Load room details
      const rooms = JSON.parse(localStorage.getItem('rooms') || '[]');
      const currentRoom = rooms.find((r: Room) => r.id === roomId);
      
      if (!currentRoom) {
        throw new Error('Room not found');
      }
      
      setRoom(currentRoom);
      logger.info('Room loaded', { roomId, roomNumber: currentRoom.number });

      // Load assigned staff
      const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');
      const currentAssignments = assignments.filter(
        (a: any) => a.roomId === roomId && a.status === 'active'
      );

      const allStaff = JSON.parse(localStorage.getItem('staff') || '[]');
      const assignedStaff = allStaff.filter((s: Staff) =>
        currentAssignments.some((a: any) => a.staffId === s.id)
      );

      if (assignedStaff.length === 0) {
        logger.warning('No staff assigned to room', { roomId });
      }

      setStaff(assignedStaff);

      // Load hotel details
      const hotel = JSON.parse(localStorage.getItem('hotel') || '{}');
      if (!hotel) {
        throw new Error('Hotel details not found');
      }
      
      setHotelDetails(hotel);

    } catch (err: any) {
      setError(err.message);
      logger.error('Failed to load tip payment details', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setShowPaymentForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0B4619] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-red-50 p-4 rounded-lg text-red-600 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!room || !hotelDetails) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <p className="text-gray-600">Room not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="text-[#0B4619] text-2xl font-bold">
          {hotelDetails.hotelName}
        </div>
      </div>

      {/* Staff Info */}
      <div className="text-center mb-8">
        <h2 className="text-xl mb-2">Tip Your Hotel Staff</h2>
        {staff.length > 0 ? (
          staff.map((member) => (
            <p key={member.id} className="text-gray-600">
              {member.name} - {member.role}
            </p>
          ))
        ) : (
          <p className="text-gray-600">No staff currently assigned</p>
        )}
      </div>

      {!showPaymentForm ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Amount Input */}
          <div>
            <label className="block text-lg mb-4">Amount to Tip</label>
            <div className="relative mb-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-3xl p-4 bg-gray-50 rounded-lg border-none"
                placeholder="50"
                min="1"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl">$</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetAmount(preset)}
                  className={`p-3 rounded-lg text-lg font-medium ${
                    amount === preset.toString()
                      ? 'bg-[#00B227] text-white'
                      : 'bg-[#E8F5E9] text-[#00B227]'
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-lg mb-4">Rate Service</label>
            <div className="flex gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`p-4 rounded-lg text-2xl ${
                    selectedEmoji === emoji
                      ? 'bg-[#00B227] text-white'
                      : 'bg-[#E8F5E9]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="relative">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Leave a comment (optional)"
              className="w-full p-4 bg-gray-50 rounded-lg border-none resize-none"
              rows={3}
            />
            {feedback && (
              <button
                type="button"
                onClick={() => setFeedback('')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#00B227] text-white py-4 rounded-lg text-lg font-medium hover:bg-[#00B227]/90"
          >
            Continue to Payment
          </button>
        </form>
      ) : (
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={Number(amount)}
            staffId={staff[0]?.id}
            roomId={roomId || ''}
            feedback={feedback}
            rating={selectedEmoji || ''}
            onSuccess={() => {
              logger.success('Payment successful', { 
                amount,
                roomId,
                staffId: staff[0]?.id 
              });
              navigate('/payment-success');
            }}
            onError={(error) => {
              setError(error);
              logger.error('Payment failed', { error });
            }}
          />
        </Elements>
      )}
    </div>
  );
};

export default TipPayment;