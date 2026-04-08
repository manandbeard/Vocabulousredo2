import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { getMe, logout } from "@workspace/api-client-react";

export type Role = "teacher" | "student";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

interface RoleContextType {
  role: Role | null;
  userId: number | null;
  user: AuthUser | null;
  loading: boolean;
  setRole: (role: Role | null) => void;
  refetchUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser({ id: me.id, name: me.name, email: me.email, role: me.role as Role });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const setRole = useCallback((_role: Role | null) => {
    fetchUser();
  }, [fetchUser]);

  const refetchUser = useCallback(async () => {
    setLoading(true);
    await fetchUser();
  }, [fetchUser]);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch {
    }
    setUser(null);
  }, []);

  const role = user?.role ?? null;
  const userId = user?.id ?? null;

  return (
    <RoleContext.Provider value={{ role, userId, user, loading, setRole, refetchUser, signOut }}>
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
