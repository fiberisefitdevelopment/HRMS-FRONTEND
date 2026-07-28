"use client";

import { useEffect } from "react";
import { useCompanyStore } from "@/store/company-store";
import { useCompaniesQuery } from "@/hooks/queries/use-companies-queries";
import { useAuthStore } from "@/store/auth-store";

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const setCompanies = useCompanyStore((s) => s.setCompanies);
  const setLoading = useCompanyStore((s) => s.setLoading);
  const clear = useCompanyStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data, isLoading, isError } = useCompaniesQuery();

  useEffect(() => {
    if (!isAuthenticated) {
      clear();
      return;
    }

    setLoading(isLoading);

    if (data?.data) {
      const accessibleIds = new Set(user?.accessibleCompanyIds ?? []);
      const filtered =
        user?.role === "owner"
          ? data.data
          : data.data.filter((company) => accessibleIds.has(company.id));

      if (user?.company && !filtered.some((c) => c.id === user.company?.id)) {
        filtered.unshift({
          id: user.company.id,
          companyName: user.company.name,
          companyCode: user.company.code ?? "",
          logo: user.company.logo,
          status: user.company.status ?? "active",
        });
      }

      setCompanies(filtered);
    }

    if (isError) {
      if (user?.company) {
        setCompanies([
          {
            id: user.company.id,
            companyName: user.company.name,
            companyCode: user.company.code ?? "",
            logo: user.company.logo,
            status: user.company.status ?? "active",
          },
        ]);
      } else {
        setCompanies([]);
      }
    }
  }, [isAuthenticated, data, isLoading, isError, user, setCompanies, setLoading, clear]);

  return <>{children}</>;
}
