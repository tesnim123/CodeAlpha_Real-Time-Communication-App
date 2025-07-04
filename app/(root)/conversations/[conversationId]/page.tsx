'use client';

import ConversationContainer from '@/components/ui/shared/conversation/ConversationContainer';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import React, { use } from 'react';
import Header from './_components/Header';
import Body from './_components/body/Body';
import ChatInput from './_components/input/ChatInput';

type Props = {
  params: Promise<{
    conversationId: Id<"conversations">;
  }>;
};

const ConversationPage = ({ params }: Props) => {
  // Unwrap params
  const resolvedParams = use(params);
  const queryParams = React.useMemo(() => ({ id: resolvedParams.conversationId }), [resolvedParams.conversationId]);
  const conversation = useQuery(api.conversation.get, queryParams);
  return (
    conversation===undefined?
    <div className='w-full h-full flex items-center justify-center'>
      <Loader2 className="h-8 w-8"/>
    </div>:
    conversation===null?<p className='w-full h-full flex items-center justify-center'>Conversation not found</p>
    :<ConversationContainer>
      <Header name={(conversation.isGroup?conversation.name:conversation.otherMember.username)||""} 
      imageUrl={conversation.isGroup?undefined:conversation.otherMember.imageUrl}/>
      <Body />
      <ChatInput />
    </ConversationContainer>
  )

  

   

  
};

export default ConversationPage;
