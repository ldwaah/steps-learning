import { apiFetch } from "./api/client";
import { getApiBaseUrl } from "./api/config";
import type { TeamColour } from "./teams";

export type SchoolInviteInfo = {
  name: string;
  slug: string;
  city: string;
  postcode: string;
};

export async function fetchSchoolByInvite(token: string): Promise<SchoolInviteInfo> {
  const res = await fetch(`${getApiBaseUrl()}/auth/invite/${encodeURIComponent(token)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Invalid link");
  return data.school as SchoolInviteInfo;
}

export async function registerSchool(input: {
  schoolName: string;
  schoolSlug: string;
  city: string;
  postcode: string;
  adminFirstName: string;
  adminPin: string;
}): Promise<{
  schoolName: string;
  schoolSlug: string;
  inviteUrl: string;
  adminUsername: string;
  message: string;
}> {
  return apiFetch("/auth/register/school", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function registerPupil(input: {
  inviteToken: string;
  firstName: string;
  teamColour: TeamColour;
  pin: string;
}): Promise<{
  username: string;
  schoolSlug: string;
  schoolName: string;
  message: string;
}> {
  return apiFetch("/auth/register/pupil", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
