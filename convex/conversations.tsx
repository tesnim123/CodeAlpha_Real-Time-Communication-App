
import { ConvexError } from "convex/values";
import { MutationCtx, query, QueryCtx } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { Id } from "./_generated/dataModel";

// GET REQUESTS WITH SENDER INFO
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

    const conversationMemberships = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    const conversations =  await Promise.all(
      conversationMemberships?.map(async (membership) => {
        const conversation = await ctx.db.get(membership.conversationId);
        if (!conversation) {
          throw new ConvexError("Conversation could not be found");
        }
        return conversation;
      })
    );

    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        const allConversationMemberships = await ctx.db
          .query("conversationMembers")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conversation?._id)
          )
          .collect();
          const lastMessage=await getLastMessageDetails({
            ctx,id:conversation.lastMessageId
          })

        if (conversation.isGroup) {
          return { conversation ,lastMessage};
        } else {
           const otherMembership=allConversationMemberships.filter((membership)=>membership.memberId!==currentUser._id)[0];
            const otherMember=await ctx.db.get(otherMembership.memberId);
            return{
                conversation,otherMember,lastMessage
          };
        }
      })
    );

    return conversationsWithDetails;
  },
});
const getLastMessageDetails=async({ctx,id}:{ctx:QueryCtx | MutationCtx;id:Id<"messages"> | undefined})=>{
  if(!id) return null;
  const message=await ctx.db.get(id);
  if(!message) return null;
  const sender=await ctx.db.get(message.senderId)
  if(!sender){
    return null
  }
  const content=getMessageContent(message.type,message.content as unknown as string)

  return {
    content,
    sender:sender.username
  }
  
}
const getMessageContent=(type:string,content:string)=>{
  switch(type){
    case "text":
      return content;
    default:return "[Non-text]"
  }
}