'use client';

import React, { createContext, useContext, useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';

type CallContextType = {
  callId: Id<'calls'> | null;
  setCallId: (id: Id<'calls'> | null) => void;
};

// Create the context
const CallContext = createContext<CallContextType | undefined>(undefined);

// Exported provider component
export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [callId, setCallId] = useState<Id<'calls'> | null>(null);

  return (
    <CallContext.Provider value={{ callId, setCallId }}>
      {children}
    </CallContext.Provider>
  );
};

// Hook to use the call context
export const useCall = (): CallContextType => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
