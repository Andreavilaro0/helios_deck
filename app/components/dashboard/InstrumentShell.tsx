import * as React from "react";

export function InstrumentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#eef1fb]">
      {children}
    </div>
  );
}
