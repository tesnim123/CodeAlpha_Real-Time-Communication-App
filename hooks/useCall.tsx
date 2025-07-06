'use client';

import { create } from 'zustand';
import { Id } from '@/convex/_generated/dataModel';

type CallState = {
  /** The currently active call’s ID, or null when not in a call */
  callId: Id<'calls'> | null;
  /** Setter (use like: const { setCallId } = useCall(); setCallId(id);) */
  setCallId: (id: Id<'calls'> | null) => void;
};

/**
 * Global store.  Because it lives outside React’s render tree,
 * every component that imports `useCall` shares the same state.
 */
export const useCall = create<CallState>((set) => ({
  callId: null,
  setCallId: (id) => set({ callId: id }),
}));
