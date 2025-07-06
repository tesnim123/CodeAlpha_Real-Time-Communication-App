// components/SocketProvider.tsx
'use client';

import React, { useEffect } from 'react';
import socket from '@/lib/socket';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
      console.log('Socket connected');
    }

    return () => {
      socket.disconnect();
      console.log('Socket disconnected');
    };
  }, []);

  return <>{children}</>;
}
