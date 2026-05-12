import { createCookieSessionStorage, redirect } from "react-router";

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "__helios_session",
    secrets: [process.env.SESSION_SECRET ?? "helios-dev-secret-change-in-prod"],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

export { getSession, commitSession, destroySession };

// Demo credentials — in production replace with real user lookup
const DEMO_USERS: Record<string, string> = {
  admin: "helios2025",
  demo:  "demo1234",
};

export function validateCredentials(username: string, password: string): boolean {
  return DEMO_USERS[username.toLowerCase()] === password;
}

export async function requireUser(request: Request): Promise<string> {
  const session = await getSession(request.headers.get("Cookie"));
  const userId  = session.get("userId") as string | undefined;
  if (!userId) throw redirect("/login");
  return userId;
}

export async function createUserSession(userId: string, redirectTo: string): Promise<Response> {
  const session = await getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export async function destroyUserSession(request: Request, redirectTo = "/login"): Promise<Response> {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
