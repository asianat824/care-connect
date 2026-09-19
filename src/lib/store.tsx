import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppState } from "./types";
import { seedState } from "./demo-data";

const KEY = "care-space-demo-v1";

interface Ctx {
  state: AppState;
  setState: (updater: (s: AppState) => AppState) => void;
  reset: () => void;
  ready: boolean;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setRaw] = useState<AppState>(() => seedState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setRaw(JSON.parse(saved) as AppState);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const setState = (updater: (s: AppState) => AppState) => setRaw((s) => updater(s));

  const reset = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setRaw(seedState());
  };

  return (
    <StoreContext.Provider value={{ state, setState, reset, ready }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
