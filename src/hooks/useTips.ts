import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Tip } from '../types';

export function useTips(staffId?: string) {
  const [tips, setTips] = useLocalStorage<Tip[]>('tips', []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const createTip = async (tipData: Omit<Tip, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newTip = {
        id: Date.now().toString(),
        ...tipData,
        createdAt: new Date()
      };
      setTips([...tips, newTip]);
      return { success: true, tipId: newTip.id };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const getStaffTips = () => {
    if (!staffId) return tips;
    return tips.filter(tip => tip.staffId === staffId);
  };

  const getTipStats = () => {
    const staffTips = getStaffTips();
    return {
      total: staffTips.reduce((sum, tip) => sum + tip.amount, 0),
      count: staffTips.length,
      average: staffTips.length > 0
        ? staffTips.reduce((sum, tip) => sum + tip.amount, 0) / staffTips.length
        : 0
    };
  };

  return {
    tips: getStaffTips(),
    loading,
    error,
    createTip,
    stats: getTipStats()
  };
}