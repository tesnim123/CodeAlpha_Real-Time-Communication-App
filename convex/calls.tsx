import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

// GET INCOMING CALLS WITH CALLER INFO
export const get = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    // Fetch all active incoming calls (not ended) for the current user
    const calls = await ctx.db
      .query("calls")
      .withIndex("by_receiverId", (q) => q.eq("receiverId", currentUser._id))
      .collect();

    const activeCalls = calls.filter((call) => !call.endedAt);

    const callsWithCaller = await Promise.all(
      activeCalls.map(async (call) => {
        const caller = await ctx.db.get(call.callerId);
        if (!caller) {
          throw new ConvexError("Call caller could not be found");
        }
        return { caller, call };
      })
    );

    return callsWithCaller;
  },
});

// COUNT ACTIVE INCOMING CALLS
export const count = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    const calls = await ctx.db
      .query("calls")
      .withIndex("by_receiverId", (q) => q.eq("receiverId", currentUser._id))
      .collect();

    const activeCalls = calls.filter((call) => !call.endedAt);

    return activeCalls.length;
  },
});
