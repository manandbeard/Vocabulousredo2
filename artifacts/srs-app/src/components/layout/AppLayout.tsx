import { ReactNode } from "react";
import { useRole } from "@/hooks/use-role";

export function AppLayout({ children }: { children: ReactNode }) {
  const { role } = useRole();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white font-['Inter']">
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
