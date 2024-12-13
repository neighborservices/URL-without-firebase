import React, { useState } from 'react';
import { DoorClosed, QrCode, Download, Printer, Search, Plus, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useRooms } from '../hooks/useRooms';
import { useAssignments } from '../hooks/useAssignments';
import { useStaff } from '../hooks/useStaff';
import LoadingScreen from '../components/LoadingScreen';
import AddRoomModal from '../components/AddRoomModal';
import { logger } from '../lib/logger';
import type { Room } from '../types';

const Rooms = () => {
  const { rooms, loading, error, createRoom } = useRooms();
  const { getCurrentAssignmentForRoom } = useAssignments();
  const { staff } = useStaff();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRPreview, setShowQRPreview] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRoom = async (roomData: any) => {
    try {
      setIsSubmitting(true);
      await createRoom(roomData);
      setShowAddModal(false);
      logger.success('Room added successfully', { roomNumber: roomData.number });
    } catch (err) {
      logger.error('Failed to add room', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShowQR = (room: Room) => {
    setSelectedRoom(room);
    setShowQRPreview(true);
    logger.action('show_qr', 'Rooms', { roomId: room.id });
  };

  const generateTipUrl = (roomId: string) => {
    return `${window.location.origin}/tip/${roomId}`;
  };

  const openTipPage = (room: Room) => {
    try {
      const tipUrl = generateTipUrl(room.id);
      window.open(tipUrl, '_blank', 'noopener,noreferrer');
      logger.success('Opened tip page', { roomId: room.id, url: tipUrl });
    } catch (err) {
      logger.error('Failed to open tip page', err);
    }
  };

  const downloadQR = (room: Room) => {
    try {
      const canvas = document.getElementById(`qr-${room.id}`) as HTMLCanvasElement;
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `room-${room.number}-qr.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        logger.success('QR code downloaded', { roomId: room.id });
      }
    } catch (err) {
      logger.error('Failed to download QR code', err);
    }
  };

  const QRPreviewModal = () => {
    if (!selectedRoom) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Room {selectedRoom.number}</h2>
            <p className="text-gray-600">Floor {selectedRoom.floor}</p>
          </div>

          <div className="flex justify-center mb-6">
            <QRCode
              id={`qr-preview-${selectedRoom.id}`}
              value={generateTipUrl(selectedRoom.id)}
              size={300}
              level="H"
              includeMargin={true}
            />
          </div>

          <p className="text-center text-gray-700 text-lg mb-8">
            Scan to tip the staff assigned to this room
          </p>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setShowQRPreview(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Rooms</h1>
          <p className="text-gray-500 mt-1">Manage rooms and QR codes</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90"
        >
          <Plus className="w-5 h-5" />
          Add Room
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">All Rooms</h2>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rooms"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => {
              const currentAssignment = getCurrentAssignmentForRoom(room.id);
              const assignedStaff = currentAssignment 
                ? staff.find(s => s.id === currentAssignment.staffId)
                : null;

              return (
                <div key={room.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <DoorClosed className="w-6 h-6 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-lg">Room {room.number}</h3>
                        <p className="text-gray-500">Floor {room.floor}</p>
                        {assignedStaff && (
                          <p className="text-sm text-[#0B4619] mt-1">
                            Currently assigned: {assignedStaff.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mb-4">
                    <QRCode
                      id={`qr-${room.id}`}
                      value={generateTipUrl(room.id)}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShowQR(room)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0B4619] text-white rounded-lg hover:bg-[#0B4619]/90"
                    >
                      <QrCode className="w-5 h-5" />
                      Print QR
                    </button>
                    <button
                      onClick={() => downloadQR(room)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openTipPage(room)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      title="Preview payment page"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddRoomModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddRoom}
          isSubmitting={isSubmitting}
        />
      )}

      {showQRPreview && <QRPreviewModal />}
    </div>
  );
};

export default Rooms;