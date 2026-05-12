import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import { AppSidebar, useSidebarVisible } from "~/components/layout/AppSidebar";
import "./app.css";

const FULL_SCREEN_ROUTES: string[] = [];

export const links: Route.LinksFunction = () => [];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const showSidebar = useSidebarVisible();

  if (FULL_SCREEN_ROUTES.includes(pathname)) {
    return <Outlet />;
  }

  return (
    <div
      className="min-h-screen pt-[34px] pb-[34px] px-[48px]"
      style={{ background: "#020811" }}
    >
      <div
        className="flex min-h-[calc(100vh-68px)] overflow-hidden"
        style={{
          borderRadius: "28px",
          background: "#030915",
          backgroundImage: `
            radial-gradient(circle at 18% 18%, rgba(43,98,214,0.14) 0%, transparent 25%),
            radial-gradient(circle at 76% 32%, rgba(52,129,255,0.08) 0%, transparent 26%),
            radial-gradient(circle at 52% 100%, rgba(8,28,69,0.30) 0%, transparent 42%)
          `,
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 40px 80px rgba(0,0,0,0.6)",
        }}
      >
        {showSidebar && <AppSidebar />}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AppShell />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
