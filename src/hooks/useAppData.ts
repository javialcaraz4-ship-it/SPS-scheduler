import { useState } from 'react';
import {
  coaches as initialCoaches,
  schools as initialSchools,
  shifts as initialShifts,
  availabilities as initialAvailabilities,
} from '../data/mockData';
import type { Coach, School, Shift, CoachAvailability } from '../types';

export function useAppData() {
  const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [availability, setAvailability] = useState<CoachAvailability[]>(initialAvailabilities);

  const addShift = (shift: Shift) => setShifts(prev => [...prev, shift]);
  const updateShift = (updated: Shift) =>
    setShifts(prev => prev.map(s => (s.id === updated.id ? updated : s)));
  const deleteShift = (id: string) =>
    setShifts(prev => prev.filter(s => s.id !== id));

  const addCoach = (coach: Coach) => setCoaches(prev => [...prev, coach]);
  const updateCoach = (updated: Coach) =>
    setCoaches(prev => prev.map(c => (c.id === updated.id ? updated : c)));

  const addSchool = (school: School) => setSchools(prev => [...prev, school]);
  const updateSchool = (updated: School) =>
    setSchools(prev => prev.map(s => (s.id === updated.id ? updated : s)));

  const addAvailability = (a: CoachAvailability) =>
    setAvailability(prev => [...prev, a]);
  const updateAvailability = (updated: CoachAvailability) =>
    setAvailability(prev => prev.map(a => (a.id === updated.id ? updated : a)));
  const deleteAvailability = (id: string) =>
    setAvailability(prev => prev.filter(a => a.id !== id));

  return {
    coaches, schools, shifts, availability,
    addShift, updateShift, deleteShift,
    addCoach, updateCoach,
    addSchool, updateSchool,
    addAvailability, updateAvailability, deleteAvailability,
  };
}
