import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Role = "teacher" | "student";

interface RoleContextType {
  role: Role | null;
  setRole: (role: Role) => void;
  userId: number | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("vocabulous_role");
      return (stored as Role | null) || null;
    }
    return null;
  });

  // Save to localStorage whenever role changes
  useEffect(() => {
    if (role) {
      localStorage.setItem("vocabulous_role", role);
    } else {
      localStorage.removeItem("vocabulous_role");
    }
  }, [role]);

  // Mock IDs for the demo: Teacher is 1, Student is 2
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
