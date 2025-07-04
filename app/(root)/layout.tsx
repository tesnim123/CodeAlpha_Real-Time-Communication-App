import React from 'react'
import Sidebarwrapper from '@/components/ui/shared/sidebar/Sidebarwrapper';
type Props = React.PropsWithChildren<{
 

}>

const layout = ({children}: Props) => {
  return (
    <Sidebarwrapper>{children}</Sidebarwrapper>
  )
};

export default layout