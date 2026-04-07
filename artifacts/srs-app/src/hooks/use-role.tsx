import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@workspace/replit-auth-web";

export type Role = "teacher" | "student";

interface RoleContextType {
  role: Role | null;
  setRole: (role: Role | null) => void;
  userId: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  const [role, setRoleState] = useState<Role | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vocabulous_role");
      return (stored as Role | null) || null;
    }
    return null;
  });

  useEffect(() => {
    if (role) {
      localStorage.setItem("vocabulous_role", role);
    } else {
      localStorage.removeItem("vocabulous_role");
    }
  }, [role]);

  const setRole = (newRole: Role | null) => {
    setRoleState(newRole);
  };

  const userId = user?.id ?? null;
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || null
    : null;
  const profileImageUrl = user?.profileImageUrl ?? null;

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        userId,
        displayName,
        profileImageUrl,
        isAuthLoading: isLoading,
        isAuthenticated,
        login,
        logout,
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
