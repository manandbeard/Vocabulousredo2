import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('vocab_sidebar');
    return saved !== 'collapsed';
  });

  useEffect(() => {
    localStorage.setItem('vocab_sidebar', expanded ? 'expanded' : 'collapsed');
  }, [expanded]);

  const toggle = () => setExpanded(e => !e);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
