import { create } from "zustand";

interface CompOffDialogStore {
  open: boolean;
  date?: string;
  openForDate: (date?: string) => void;
  close: () => void;
}

export const useCompOffDialogStore = create<CompOffDialogStore>((set) => ({
  open: false,
  date: undefined,
  openForDate: (date) =>
    set({
      open: true,
      date: date?.slice(0, 10),
    }),
  close: () => set({ open: false }),
}));
