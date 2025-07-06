// convex/calls/endCall.ts

import { v } from 'convex/values';
import { mutation } from '../_generated/server';

export const endCall = mutation({
  args: {
    callId: v.id('calls'),
    endedAt: v.number(), // Date.now()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.callId, {
      endedAt: args.endedAt,
    });
  },
});
