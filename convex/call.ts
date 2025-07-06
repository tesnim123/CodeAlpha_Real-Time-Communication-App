import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";


export const start = mutation({
  args: {
    conversationId: v.id("conversations"),
    receiverId: v.id("users"),
    isVideo: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });
    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    const now = Date.now();
    const STALE_LIMIT = 5 * 60 * 1000; // 5 minutes in ms

    // Fetch all calls where currentUser is caller or receiver
    const callsWithCurrentUserAsCaller = await ctx.db
      .query("calls")
      .withIndex("by_callerId", (q) => q.eq("callerId", currentUser._id))
      .collect();

    const callsWithCurrentUserAsReceiver = await ctx.db
      .query("calls")
      .withIndex("by_receiverId", (q) => q.eq("receiverId", currentUser._id))
      .collect();

    // Fetch all calls where receiver is caller or receiver
    const callsWithReceiverAsCaller = await ctx.db
      .query("calls")
      .withIndex("by_callerId", (q) => q.eq("callerId", args.receiverId))
      .collect();

    const callsWithReceiverAsReceiver = await ctx.db
      .query("calls")
      .withIndex("by_receiverId", (q) => q.eq("receiverId", args.receiverId))
      .collect();

    // Combine all relevant calls
    const allRelevantCalls = [
      ...callsWithCurrentUserAsCaller,
      ...callsWithCurrentUserAsReceiver,
      ...callsWithReceiverAsCaller,
      ...callsWithReceiverAsReceiver,
    ];

    // Check if any call is active (not ended and not stale)
    const activeCallExists = allRelevantCalls.some(
      (call) =>
        !call.endedAt && now - call.startedAt < STALE_LIMIT
    );

    if (activeCallExists) {
      throw new ConvexError(
        "Either you or the other user is already in another call"
      );
    }

    // Additional check: prevent a new call between the same two users if one already exists
    const activeCallBetweenUsers = allRelevantCalls.find(
      (call) =>
        !call.endedAt &&
        now - call.startedAt < STALE_LIMIT &&
        (
          (call.callerId === currentUser._id && call.receiverId === args.receiverId) ||
          (call.callerId === args.receiverId && call.receiverId === currentUser._id)
        )
    );

    if (activeCallBetweenUsers) {
      throw new ConvexError(
        "You already have an active call with this user"
      );
    }

    // Insert new call only if no active call exists
    const newCall = await ctx.db.insert("calls", {
      callerId: currentUser._id,
      receiverId: args.receiverId,
      conversationId: args.conversationId,
      isVideo: args.isVideo,
      startedAt: now,
    });

    return newCall;
  },
});




export const end = mutation({
  args: {
    callId: v.id("calls"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser) throw new ConvexError("User not found");

    const call = await ctx.db.get(args.callId);
    if (!call) throw new ConvexError("Call not found");

    if (call.callerId !== currentUser._id && call.receiverId !== currentUser._id) {
      throw new ConvexError("You are not a participant in this call");
    }

    if (call.endedAt) throw new ConvexError("Call has already ended");

    await ctx.db.patch(call._id, {
      endedAt: Date.now(),
    });
     return { success: true };
  },
  
});

export const deny = mutation({
  args: {
    callId: v.id("calls"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });
    if (!currentUser) throw new ConvexError("User not found");

    const call = await ctx.db.get(args.callId);
    if (!call) throw new ConvexError("Call not found");

    if (call.receiverId !== currentUser._id) {
      throw new ConvexError("Only the receiver can deny the call");
    }

    if (call.endedAt) {
      throw new ConvexError("Call already ended or denied");
    }

    // Mark call as denied (we reuse endedAt for simplicity)
    await ctx.db.patch(call._id, {
      endedAt: Date.now(),
    });
    
  },
});
