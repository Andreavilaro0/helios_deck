import * as React from "react";

export function InstrumentShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="instrument-shell min-h-screen">
      {children}
    </main>
  );
}
