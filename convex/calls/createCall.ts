// convex/calls/createCall.ts

import { v } from 'convex/values';
import { mutation } from '../_generated/server';


export const createCall = mutation({
  args: {
    callerId: v.id('users'),
    receiverId: v.id('users'),
    conversationId: v.id('conversations'),
    isVideo: v.boolean(),
    startedAt: v.number(), // Date.now()
  },
  handler: async (ctx, args) => {
    const callId = await ctx.db.insert('calls', {
      callerId: args.callerId,
      receiverId: args.receiverId,
      conversationId: args.conversationId,
      isVideo: args.isVideo,
      startedAt: args.startedAt,
    });

    return callId;
  },
});
