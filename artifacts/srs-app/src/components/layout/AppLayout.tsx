import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useRole } from "@/hooks/use-role";

export function AppLayout({ children }: { children: ReactNode }) {
  const { role } = useRole();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between px-8 border-b border-border/60 bg-card/50 backdrop-blur-sm z-10">
          <h1 className="text-lg font-semibold text-foreground capitalize">
            {role} Portal
          </h1>
          <div className="flex items-center gap-4">
            {/* Add user profile, notifications, etc. here later */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
