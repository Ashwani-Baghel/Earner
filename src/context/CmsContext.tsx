"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface CmsContextType {
  header: any;
  hero: any;
  footer: any;
  categories: any[];
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export function CmsProvider({ 
  children, 
  initialData 
}: { 
  children: ReactNode, 
  initialData: CmsContextType 
}) {
  return (
    <CmsContext.Provider value={initialData}>
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const context = useContext(CmsContext);
  if (context === undefined) {
    throw new Error("useCms must be used within a CmsProvider");
  }
  return context;
}
