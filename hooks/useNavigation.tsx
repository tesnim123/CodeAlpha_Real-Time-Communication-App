import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { MessageSquare, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const useNavigation = () => {
  const pathname = usePathname();

  // ✅ Fetch friend requests count only for "Friends"
  const requestsCount = useQuery(api.requests.count);

  const paths = useMemo(
    () => [
      {
        name: "conversations",
        href: "/conversations",
        icon: <MessageSquare />,
        active: pathname.startsWith("/conversations"),
        count: undefined // no count for conversations
      },
      {
        name: "friends",
        href: "/friends",
        icon: <Users />,
        active: pathname === "/friends",
        count: requestsCount ?? 0 // count for friend requests
      }
    ],
    [pathname, requestsCount]
  );

  return paths;
};

export { useNavigation };
