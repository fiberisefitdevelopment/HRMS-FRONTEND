"use client";

import { useCallback, useState } from "react";

export function useServerListState(pageSize = 10) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  return {
    page,
    pageSize,
    search,
    setPage,
    onSearchChange,
    resetPage: () => setPage(1),
  };
}
