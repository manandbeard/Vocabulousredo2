import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Role = "teacher" | "student";

interface RoleContextType {
  role: Role | null;
  setRole: (role: Role | null) => void;
  userId: number | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
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

  const userId = role === "teacher" ? 1 : role === "student" ? 2 : null;

  return (
    <RoleContext.Provider value={{ role, setRole, userId }}>
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
