import { useEffect, useState, type ReactNode } from "react";
import { getApiToken } from "../lib/api/client";
import { isApiMode } from "../lib/api/config";
import { isProgressCacheReady } from "../lib/api/progressCache";
import { hydrateStudentState } from "../lib/api/student";
import { refreshAuditFromServer } from "../lib/audit";
import { getCurrentUser } from "../lib/authSession";

/** Loads student state from API after refresh when a token exists. */
export default function ApiBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => !isApiMode() || !getApiToken());

  useEffect(() => {
    if (!isApiMode() || !getApiToken()) {
      setReady(true);
      return;
    }
    if (isProgressCacheReady()) {
      setReady(true);
      return;
    }
    const userId = getCurrentUser()?.id;
    if (!userId) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        await hydrateStudentState();
        await refreshAuditFromServer(userId);
      } catch {
        /* token may be expired */
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#0a0a0a",
          color: "#888",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
