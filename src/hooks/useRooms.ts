import { useState, useEffect } from 'react';
import { roomStorage } from '../lib/storage';
import type { Room } from '../types';

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const loadedRooms = roomStorage.getAll();
      setRooms(loadedRooms);
    } catch (err: any) {
      console.error('Error loading rooms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = async (roomData: Omit<Room, 'id'>) => {
    try {
      setError(null);
      const newRoom = {
        id: Date.now().toString(),
        ...roomData,
        assignedStaff: [],
        createdAt: new Date().toISOString()
      };
      roomStorage.add(newRoom as Room);
      setRooms(prev => [...prev, newRoom as Room]);
      return { success: true, roomId: newRoom.id };
    } catch (err: any) {
      console.error('Error creating room:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateRoom = async (roomId: string, updates: Partial<Room>) => {
    try {
      setError(null);
      roomStorage.update(roomId, updates);
      setRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, ...updates } : room
      ));
      return { success: true };
    } catch (err: any) {
      console.error('Error updating room:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      setError(null);
      roomStorage.remove(roomId);
      setRooms(prev => prev.filter(room => room.id !== roomId));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting room:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    rooms,
    loading,
    error,
    createRoom,
    updateRoom,
    deleteRoom
  };
}