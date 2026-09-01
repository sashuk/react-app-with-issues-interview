import { useEffect, useState } from "react";
import { loadSnapshot } from "./api";
import Dashboard from "./Dashboard";
import type { DashboardSnapshot } from "./types";

export default function App() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSnapshot()
      .then(setSnapshot)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <div className="placeholder">{error}</div>;
  if (!snapshot) return <div className="placeholder">Loading snapshot…</div>;

  return <Dashboard snapshot={snapshot} />;
}
