import { createContext, useContext } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { Coach, School, Shift, CoachAvailability } from '../types';

export interface AppData {
  coaches: Coach[];
  schools: School[];
  shifts: Shift[];
  availability: CoachAvailability[];
  addShift: (s: Shift) => void;
  updateShift: (s: Shift) => void;
  deleteShift: (id: string) => void;
  addCoach: (c: Coach) => void;
  updateCoach: (c: Coach) => void;
  addSchool: (s: School) => void;
  updateSchool: (s: School) => void;
  addAvailability: (a: CoachAvailability) => void;
  updateAvailability: (a: CoachAvailability) => void;
  deleteAvailability: (id: string) => void;
}

const DataContext = createContext<AppData | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const data = useAppData();
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useData(): AppData {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
