import { resetDemoParticipants } from "./resetDemo";
import { DEFAULT_USERS, ensureSeedUsers } from "./storage";

const MIGRATION_KEY = "steps_app_migration";
const CURRENT_VERSION = 3;

/** One-time and versioned fixes on app load (local device). */
export function runAppMigrations(): void {
  ensureSeedUsers();

  const raw = localStorage.getItem(MIGRATION_KEY);
  const version = raw ? parseInt(raw, 10) : 0;
  if (version >= CURRENT_VERSION) return;

  if (version < 3) {
    resetDemoParticipants();
    syncDemoProfiles();
  }

  localStorage.setItem(MIGRATION_KEY, String(CURRENT_VERSION));
}

function syncDemoProfiles(): void {
  const raw = localStorage.getItem("steps_users");
  if (!raw) return;
  try {
    const users = JSON.parse(raw) as typeof DEFAULT_USERS;
    const merged = users.map((u) => {
      const seed = DEFAULT_USERS.find((d) => d.id === u.id);
      if (!seed) return u;
      return {
        ...u,
        username: seed.username,
        pin: seed.pin,
        firstName: seed.firstName,
        yearGroup: seed.yearGroup,
        points: seed.points,
        level: seed.level,
      };
    });
    localStorage.setItem("steps_users", JSON.stringify(merged));
  } catch {
    localStorage.setItem("steps_users", JSON.stringify(DEFAULT_USERS));
  }
}
