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

const FULL_SCREEN_ROUTES = ["/earth-weather"];

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
      style={{ background: "#060e14" }}
    >
      <div
        className="flex min-h-[calc(100vh-68px)] overflow-hidden"
        style={{
          borderRadius: "28px",
          background: "#17262f",
          border: "1px solid rgba(249,243,250,0.09)",
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
