import "server-only";
import { cookies } from "next/headers";
import { CURRENT_USER_SESSION_COOKIE, parseCurrentUserSession, type CurrentUserSession } from "./sessionTypes";

export async function getCurrentUserSession(): Promise<CurrentUserSession | null> {
  const store = await cookies();
  return parseCurrentUserSession(store.get(CURRENT_USER_SESSION_COOKIE)?.value);
}

