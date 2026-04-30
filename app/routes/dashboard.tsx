import { Link } from "react-router";
import type { Route } from "./+types/dashboard";
import { SignalCard } from "~/components/widgets/SignalCard";
import {
  getLatestSignalByName,
  listRecentSignalsByName,
} from "~/services/signals.server";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Observatory Dashboard — HELIOS_DECK" },
    { name: "description", content: "Live Kp index and space weather signals." },
  ];
}

// Loader is synchronous — better-sqlite3 is a sync driver.
// No external fetch here: data comes from the local SQLite file.
export function loader(_: Route.LoaderArgs) {
  const latestSignal = getLatestSignalByName("kp-index");
  const recentSignals = listRecentSignalsByName("kp-index", 60);
  return { latestSignal, recentSignals };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { latestSignal, recentSignals } = loaderData;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight font-mono">
              HELIOS_DECK
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Planetary Geomagnetic Activity Monitor
            </p>
          </div>
          <Link
            to="/"
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-1"
          >
            ← Home
          </Link>
        </header>

        <DashboardBody latestSignal={latestSignal} recentSignals={recentSignals} />

      </div>
    </main>
  );
}

interface DashboardBodyProps {
  latestSignal: Route.ComponentProps["loaderData"]["latestSignal"];
  recentSignals: Route.ComponentProps["loaderData"]["recentSignals"];
}

function DashboardBody({ latestSignal, recentSignals }: DashboardBodyProps) {
  if (!latestSignal) {
    return <EmptyState />;
  }

  const signal = latestSignal;

  return (
    <>
      <SignalCard signal={signal} />
      <KpHistoryBars signals={recentSignals} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center space-y-3">
      <p className="text-gray-500 dark:text-gray-400 font-medium">
        No NOAA Kp data available yet.
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        Run the ingestion script to populate the database:
      </p>
      <code className="block text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded px-4 py-2 font-mono">
        npm run ingest:noaa-kp
      </code>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kp history sparkline — CSS bars, no chart library
// ---------------------------------------------------------------------------

interface KpHistoryBarsProps {
  signals: Route.ComponentProps["loaderData"]["recentSignals"];
}

function KpHistoryBars({ signals }: KpHistoryBarsProps) {
  if (signals.length === 0) return null;

  // Reverse so oldest is on the left, newest on the right
  const bars = [...signals].reverse();

  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-mono uppercase tracking-widest text-gray-400">
          Kp history — last {signals.length} readings
        </h2>
        <span className="text-xs text-gray-400">scale 0 – 9</span>
      </div>

      <div className="flex items-end gap-px h-24" role="img" aria-label="Kp index history chart">
        {bars.map((s) => {
          const kp = typeof s.value === "number" ? s.value : 0;
          const heightPct = Math.round((kp / 9) * 100);
          const color =
            kp >= 5
              ? "bg-red-400 dark:bg-red-500"
              : kp >= 4
              ? "bg-yellow-400 dark:bg-yellow-500"
              : "bg-blue-400 dark:bg-blue-500";
          return (
            <div
              key={s.timestamp}
              className={`flex-1 min-w-0 rounded-t ${color} opacity-80`}
              style={{ height: `${Math.max(heightPct, 2)}%` }}
              title={`${s.timestamp}: Kp ${kp}`}
            />
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-right">
        Latest: {bars.at(-1)?.timestamp.replace("T", " ").replace("Z", " UTC")}
      </p>
    </section>
  );
}
