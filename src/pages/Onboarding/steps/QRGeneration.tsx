import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { roomStorage, onboardingStorage } from '../../../lib/storage';
import { logger } from '../../../lib/logger';
import type { Room } from '../../../types';

interface QRGenerationProps {
  onComplete: () => void;
}

const QRGeneration = ({ onComplete }: QRGenerationProps) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [generatedQRs, setGeneratedQRs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const loadedRooms = roomStorage.getAll();
      setRooms(loadedRooms);
      logger.info('Loaded rooms for QR generation', { count: loadedRooms.length });
    } catch (err: any) {
      console.error('Error loading rooms:', err);
      setError('Failed to load rooms. Please try again.');
      logger.error('Failed to load rooms for QR generation', err);
    }
  }, []);

  const generateQRValue = (roomId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/tip/${roomId}`;
  };

  const downloadQR = async (room: Room) => {
    try {
      logger.action('download_qr', 'QRGeneration', { roomId: room.id });
      const canvas = document.getElementById(`qr-${room.id}`) as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('QR Code canvas not found');
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            throw new Error('Failed to create blob from canvas');
          }
        }, 'image/png');
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `room-${room.number}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setGeneratedQRs(prev => new Set([...prev, room.id]));
      roomStorage.update(room.id, {
        qrGenerated: true,
        qrGeneratedAt: new Date().toISOString()
      });

      logger.success('QR code downloaded', { roomId: room.id, roomNumber: room.number });
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
      logger.error('Failed to generate QR code', err);
    }
  };

  const handleComplete = async () => {
    if (generatedQRs.size !== rooms.length) return;

    try {
      setIsLoading(true);
      setError(null);
      logger.action('complete_onboarding', 'QRGeneration');

      onboardingStorage.complete();
      onComplete();
      navigate('/', { replace: true });
      
      logger.success('Onboarding completed');
    } catch (err: any) {
      console.error('Error completing onboarding:', err);
      setError('Failed to complete setup. Please try again.');
      logger.error('Failed to complete onboarding', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Generate QR Codes</h2>
        <p className="text-gray-600">
          Generate and download QR codes for each room. Place these in your rooms so guests can easily tip staff.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map(room => {
          const isGenerated = generatedQRs.has(room.id);
          const qrValue = generateQRValue(room.id);

          return (
            <div
              key={room.id}
              className="bg-white border rounded-lg p-6 flex flex-col items-center"
            >
              <h3 className="text-lg font-medium mb-2">Room {room.number}</h3>
              <p className="text-sm text-gray-500 mb-4">Floor {room.floor}</p>
              
              <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                <QRCodeCanvas
                  id={`qr-${room.id}`}
                  value={qrValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <button
                onClick={() => downloadQR(room)}
                disabled={isGenerated}
                className={`w-full flex items-center justify-center py-2 px-4 rounded-lg transition-colors ${
                  isGenerated
                    ? 'bg-green-50 text-green-600'
                    : 'bg-[#0B4619] text-white hover:bg-[#0B4619]/90'
                }`}
              >
                {isGenerated ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Downloaded
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Download QR Code
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleComplete}
        disabled={isLoading || generatedQRs.size !== rooms.length}
        className={`w-full py-3 rounded-lg transition-colors ${
          isLoading || generatedQRs.size !== rooms.length
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-[#0B4619] text-white hover:bg-[#0B4619]/90'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Completing Setup...
          </div>
        ) : (
          'Complete Setup'
        )}
      </button>

      {generatedQRs.size !== rooms.length && (
        <p className="text-center text-gray-500">
          Download all QR codes to continue
        </p>
      )}
    </div>
  );
};

export default QRGeneration;