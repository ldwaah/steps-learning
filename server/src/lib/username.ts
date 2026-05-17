export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12) || "student";
}

export function randomSuffix(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export async function uniqueUsernameForSchool(
  schoolId: string,
  firstName: string,
  exists: (schoolId: string, username: string) => Promise<boolean>,
): Promise<string> {
  const base = slugifyName(firstName);
  for (let attempt = 0; attempt < 20; attempt++) {
    const username = attempt === 0 ? `${base}${randomSuffix()}` : `${base}${randomSuffix()}`;
    if (!(await exists(schoolId, username))) return username;
  }
  return `${base}${Date.now().toString(36).slice(-4)}`;
}
