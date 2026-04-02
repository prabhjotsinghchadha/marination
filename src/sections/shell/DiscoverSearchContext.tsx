"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DiscoverSearchContextValue = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  /** When true, AppShell shows the discover search field in the header. */
  discoverSearchActive: boolean;
  setDiscoverSearchActive: (value: boolean) => void;
};

export const DiscoverSearchContext = createContext<DiscoverSearchContextValue | null>(null);

export function DiscoverSearchProvider(props: { children: ReactNode }) {
  const [searchQuery, setSearchQueryState] = useState("");
  const [discoverSearchActive, setDiscoverSearchActive] = useState(false);

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryState(value);
  }, []);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      discoverSearchActive,
      setDiscoverSearchActive,
    }),
    [searchQuery, setSearchQuery, discoverSearchActive],
  );

  return (
    <DiscoverSearchContext.Provider value={value}>{props.children}</DiscoverSearchContext.Provider>
  );
}

export function useDiscoverSearch(): DiscoverSearchContextValue {
  const ctx = useContext(DiscoverSearchContext);
  if (ctx === null) {
    throw new Error("useDiscoverSearch must be used within DiscoverSearchProvider");
  }
  return ctx;
}

export function useOptionalDiscoverSearch(): DiscoverSearchContextValue | null {
  return useContext(DiscoverSearchContext);
}
