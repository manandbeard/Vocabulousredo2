/**
 * Auth context — backed by Clerk for authentication and our own DB for the
 * user profile (name, role, DB id, streak, etc.).
 *
 * The RoleProvider fetches the DB user from GET /api/auth/me on mount and
 * whenever the Clerk session changes. Child components access the current
 * user via useRole().
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@clerk/react";

export type Role = "teacher" | "student";

interface DbUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  streakCount: number;
  googleId: string | null;
}

interface RoleContextType {
  /** null while loading */
  role: Role | null;
  /** null while loading or not signed in */
  userId: number | null;
  /** Full DB user record */
  dbUser: DbUser | null;
  /** true while loading the /api/auth/me response */
  isLoading: boolean;
  /** true when Clerk has a session but no DB user record yet (needs onboarding) */
  needsOnboarding: boolean;
  /** Call this after role selection to create the DB user and finish onboarding */
  completeOnboarding: (role: Role) => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Re-fetch our DB user whenever Clerk auth state changes
  useEffect(() => {
    if (!clerkLoaded) return;

    if (!isSignedIn) {
      setDbUser(null);
      setIsLoading(false);
      setNeedsOnboarding(false);
      return;
    }

    setIsLoading(true);
    fetch("/api/auth/me", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const user: DbUser = await res.json();
          setDbUser(user);
          setNeedsOnboarding(false);
        } else if (res.status === 404) {
          // Signed in with Clerk but no DB record yet
          setDbUser(null);
          setNeedsOnboarding(true);
        } else {
          setDbUser(null);
          setNeedsOnboarding(false);
        }
      })
      .catch(() => {
        setDbUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [clerkLoaded, isSignedIn]);

  const completeOnboarding = async (role: Role) => {
    const res = await fetch("/api/auth/sync-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    if (!res.ok) throw new Error("Failed to complete onboarding");
    const user: DbUser = await res.json();
    setDbUser(user);
    setNeedsOnboarding(false);
  };

  return (
    <RoleContext.Provider
      value={{
        role: dbUser?.role ?? null,
        userId: dbUser?.id ?? null,
        dbUser,
        isLoading: !clerkLoaded || isLoading,
        needsOnboarding,
        completeOnboarding,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
