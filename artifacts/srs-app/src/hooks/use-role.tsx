import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "teacher" | "student";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  userId: number;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("teacher");

  // Mock IDs for the demo: Teacher is 1, Student is 2
  const userId = role === "teacher" ? 1 : 2;

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
