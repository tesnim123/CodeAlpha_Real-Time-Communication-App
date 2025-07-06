'use client';

import ConversationContainer from '@/components/ui/shared/conversation/ConversationContainer';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import React, { use, useState } from 'react';
import Header from './_components/Header';
import Body from './_components/body/Body';
import ChatInput from './_components/input/ChatInput';
import RemoveFriendDialog from './_components/dialogs/RemoveFriendDialog';
  // <-- Import your CallPopup here


type Props = {
  params: Promise<{
    conversationId: Id<'conversations'>;
  }>;
};

const ConversationPage = ({ params }: Props) => {
  // Unwrap params
  const resolvedParams = use(params);
  const queryParams = React.useMemo(() => ({ id: resolvedParams.conversationId }), [resolvedParams.conversationId]);
  const conversation = useQuery(api.conversation.get, queryParams);

  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
  const [callId, setCallId] = useState<Id<'calls'> | null>(null);


  // Use useCall hook to manage calls
  // Make sure otherMember exists before accessing _id
  const receiverId = conversation?.otherMember._id ;
  
  if (conversation === undefined) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8" />
      </div>
    );
  }

  if (conversation === null) {
    return <p className="w-full h-full flex items-center justify-center">Conversation not found</p>;
  }

  return (
    <ConversationContainer>
      <RemoveFriendDialog
        conversationId={resolvedParams.conversationId}
        open={removeFriendDialogOpen}
        setOpen={setRemoveFriendDialogOpen}
      />

      <Header
  name={(conversation.isGroup ? conversation.name : conversation.otherMember.username) || ''}
  imageUrl={conversation.isGroup ? undefined : conversation.otherMember.imageUrl}
  conversationId={conversation._id}
  receiverId={receiverId!}
  
  options={
    conversation.isGroup
      ? [
          {
            label: 'Leave group',
            destructive: false,
            onClick: () => setLeaveGroupDialogOpen(true),
          },
          {
            label: 'Delete group',
            destructive: true,
            onClick: () => setDeleteGroupDialogOpen(true),
          },
        ]
      : [
          {
            label: 'Remove friend',
            destructive: true,
            onClick: () => setRemoveFriendDialogOpen(true),
          },
        ]
  }
/>


      <Body />
      <ChatInput />

      
      
    </ConversationContainer>
  );
};

export default ConversationPage;
