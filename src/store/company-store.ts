import { create } from "zustand";
import type { Company } from "@/types/company";

interface CompanyStore {
  companies: Company[];
  isLoading: boolean;
  setCompanies: (companies: Company[]) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useCompanyStore = create<CompanyStore>()((set) => ({
  companies: [],
  isLoading: false,
  setCompanies: (companies) => set({ companies, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ companies: [], isLoading: false }),
}));
