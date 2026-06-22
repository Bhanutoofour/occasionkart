import { headers } from "next/headers";

import { auth } from "@/lib/auth";

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    return { session: null, isAdmin: false };
  }

  const allowedAdminEmails = getAllowedAdminEmails();
  const email = session.user.email.toLowerCase();

  if (allowedAdminEmails.length === 0) {
    return {
      session,
      isAdmin: false,
    };
  }

  return {
    session,
    isAdmin: allowedAdminEmails.includes(email),
  };
}
