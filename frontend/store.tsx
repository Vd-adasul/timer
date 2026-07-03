import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, TimeBlock, Track } from './types';
import { INITIAL_STATE } from './constants';

export interface ToastType {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

export interface ConfirmDialogType {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface StoreContextType {
  state: AppState;
  saveBlock: (date: string, index: number, activityId: string, trackId?: string, partId?: string, itemId?: string) => void;
  clearData: () => void;
  addTrack: (track: Track) => void;
  deleteTrack: (id: string) => void;
  importData: (data: string) => boolean;
  toast: ToastType | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  confirmDialog: ConfirmDialogType | null;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
  hideConfirm: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'timeos_data_v2';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse local storage", e);
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [toast, setToast] = useState<ToastType | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogType | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToast({ message, type, id });
  };

  const hideToast = () => {
    setToast(null);
  };

  // Automatically clear success/info toasts after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showConfirm = (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirmDialog({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog(null);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setConfirmDialog(null);
      }
    });
  };

  const hideConfirm = () => {
    setConfirmDialog(null);
  };

  const saveBlock = (date: string, index: number, activityId: string, trackId?: string, partId?: string, itemId?: string) => {
    setState(prev => {
      const key = `${date}-${index}`;
      const newBlocks = { ...prev.blocks };
      
      if (activityId === 'clear') {
        delete newBlocks[key];
      } else {
        newBlocks[key] = { date, index, activityId, trackId, partId, itemId };
      }
      
      return { ...prev, blocks: newBlocks };
    });
  };

  const addTrack = (track: Track) => {
    setState(prev => ({
      ...prev,
      tracks: [...prev.tracks, track]
    }));
  };

  const deleteTrack = (id: string) => {
    setState(prev => ({
      ...prev,
      tracks: prev.tracks.filter(t => t.id !== id)
    }));
  };

  const clearData = () => {
    setState(INITIAL_STATE);
  };

  const importData = (dataStr: string): boolean => {
    try {
      const parsed = JSON.parse(dataStr);
      if (parsed && parsed.activities && parsed.blocks) {
        setState(parsed);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  return (
    <StoreContext.Provider value={{ 
      state, saveBlock, clearData, 
      addTrack, deleteTrack, importData,
      toast, showToast, hideToast,
      confirmDialog, showConfirm, hideConfirm
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within a StoreProvider');
  }
  return context;
};
