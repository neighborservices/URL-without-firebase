import { createContext, useContext, useState, useEffect } from 'react';
import { hotelStorage } from '../lib/storage';
import { logger } from '../lib/logger';
import type { Hotel } from '../types';

interface HotelContextType {
  hotelData: Hotel | null;
  loading: boolean;
  error: string | null;
  updateHotelData: (data: Partial<Hotel>) => void;
}

const HotelContext = createContext<HotelContextType>({
  hotelData: null,
  loading: false,
  error: null,
  updateHotelData: () => {}
});

export const useHotel = () => useContext(HotelContext);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hotelData, setHotelData] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHotelData = () => {
      try {
        const data = hotelStorage.getHotel();
        setHotelData(data);
        logger.info('Hotel data loaded', { hotelId: data?.id });
      } catch (err: any) {
        console.error('Error loading hotel data:', err);
        setError(err.message);
        logger.error('Failed to load hotel data', err);
      } finally {
        setLoading(false);
      }
    };

    loadHotelData();
  }, []);

  const updateHotelData = async (data: Partial<Hotel>) => {
    try {
      const updatedData = { ...hotelData, ...data };
      hotelStorage.setHotel(updatedData);
      setHotelData(updatedData);
      setError(null);
      logger.success('Hotel data updated', { updates: data });
    } catch (err: any) {
      console.error('Error updating hotel data:', err);
      setError(err.message);
      logger.error('Failed to update hotel data', err);
    }
  };

  return (
    <HotelContext.Provider value={{ hotelData, loading, error, updateHotelData }}>
      {children}
    </HotelContext.Provider>
  );
};