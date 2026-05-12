import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { Route } from "./+types/root";
import { AppSidebar, useSidebarVisible } from "~/components/layout/AppSidebar";
import "./app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

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
        className="flex min-h-[calc(100vh-68px)] overflow-hidden relative"
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
        {/* Animated nebula blobs — visible across all app pages */}
        <div className="blob-orb absolute top-[-18%] left-[-8%] w-[520px] h-[520px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(43,98,214,0.18) 0%, transparent 70%)", filter: "blur(90px)" }} />
        <div className="blob-orb blob-delay-4 absolute bottom-[-20%] right-[-6%] w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 70%)", filter: "blur(100px)" }} />
        <div className="blob-orb blob-delay-2 absolute top-[35%] right-[18%] w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(52,129,255,0.10) 0%, transparent 65%)", filter: "blur(75px)" }} />

        {showSidebar && <AppSidebar />}
        <div className="flex-1 min-w-0 relative" style={{ zIndex: 1 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
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
