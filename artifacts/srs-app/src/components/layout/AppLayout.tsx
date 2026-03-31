import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useRole } from "@/hooks/use-role";

export function AppLayout({ children }: { children: ReactNode }) {
  const { role } = useRole();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-['Inter']">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between px-8 border-b border-slate-200 bg-white">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {role === "teacher" ? "Teacher Portal" : "Student Portal"}
          </p>
          <div className="flex items-center gap-4" />
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
