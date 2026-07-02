import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BloodSugarEntry, WeightEntry } from '@/types';
import { getBloodSugarStatus } from '@/utils/bloodSugarUtils';
import { v4 as uuidv4 } from 'uuid';

interface BloodSugarStore {
  records: BloodSugarEntry[];
  weightRecords: WeightEntry[];
  addRecord: (record: Omit<BloodSugarEntry, 'id' | 'createdAt' | 'status'>) => void;
  updateRecord: (id: string, updates: Partial<Omit<BloodSugarEntry, 'id' | 'createdAt'>>) => void;
  deleteRecord: (id: string) => void;
  importRecords: (records: BloodSugarEntry[]) => void;
  clearRecords: () => void;
  addWeightRecord: (record: Omit<WeightEntry, 'id' | 'createdAt'>) => void;
  updateWeightRecord: (id: string, updates: Partial<Omit<WeightEntry, 'id' | 'createdAt'>>) => void;
  deleteWeightRecord: (id: string) => void;
  clearWeightRecords: () => void;
}

export const useBloodSugarStore = create<BloodSugarStore>()(
  persist(
    (set, get) => ({
      records: [],
      weightRecords: [],
      addRecord: (record) => {
        const status = getBloodSugarStatus(record.value, record.mealType, record.timePoint);
        const newRecord: BloodSugarEntry = {
          ...record,
          id: uuidv4(),
          status,
          createdAt: Date.now(),
        };
        set((state) => ({
          records: [...state.records, newRecord].sort(
            (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
          ).reverse(),
        }));
      },
      updateRecord: (id, updates) => {
        set((state) => ({
          records: state.records.map((record) => {
            if (record.id === id) {
              const updatedRecord = { ...record, ...updates };
              updatedRecord.status = getBloodSugarStatus(updatedRecord.value, updatedRecord.mealType, updatedRecord.timePoint);
              return updatedRecord;
            }
            return record;
          }).sort(
            (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
          ).reverse(),
        }));
      },
      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
        }));
      },
      importRecords: (records) => {
        set((state) => ({
          records: [...state.records, ...records].sort(
            (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
          ).reverse(),
        }));
      },
      clearRecords: () => {
        set({ records: [] });
      },
      addWeightRecord: (record) => {
        const newRecord: WeightEntry = {
          ...record,
          id: uuidv4(),
          createdAt: Date.now(),
        };
        set((state) => ({
          weightRecords: [...state.weightRecords, newRecord].sort(
            (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
          ).reverse(),
        }));
      },
      updateWeightRecord: (id, updates) => {
        set((state) => ({
          weightRecords: state.weightRecords.map((record) => {
            if (record.id === id) {
              return { ...record, ...updates };
            }
            return record;
          }).sort(
            (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime()
          ).reverse(),
        }));
      },
      deleteWeightRecord: (id) => {
        set((state) => ({
          weightRecords: state.weightRecords.filter((record) => record.id !== id),
        }));
      },
      clearWeightRecords: () => {
        set({ weightRecords: [] });
      },
    }),
    {
      name: 'blood-sugar-records',
    }
  )
);
