import React from 'react'
import Sidebarwrapper from '@/components/ui/shared/sidebar/Sidebarwrapper';
import { CallProvider } from './conversations/[conversationId]/_components/call/CallController';
type Props = React.PropsWithChildren<{
 

}>

const layout = ({children}: Props) => {
  return (
    <Sidebarwrapper>
      <CallProvider>
      {children}
    </CallProvider>
      </Sidebarwrapper>
  )
};

export default layout