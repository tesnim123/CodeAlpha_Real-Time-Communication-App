"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme/theme-toggle";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useConversation } from "@/hooks/useConversation";
import { useNavigation } from "@/hooks/useNavigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

const MobileNav = () => {
  const paths = useNavigation();
  const {isActive}=useConversation();
  if(isActive) return null;

  return (
    <Card className="fixed bottom-4 w-[calc(100vw-32px)] flex items-center h-16 p-2 lg:hidden">
      <nav className="w-full">
        <ul className="flex justify-evenly items-center w-full">
          {paths.map((path, id) => (
            <li key={id} className="relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={path.href}>
                    <Button size="icon" variant={path.active ? "default" : "outline"}>
                      {path.icon}
                      {/* ✅ Show count only on the "Friends" icon */}
                                            {path.name === "friends" && path.count != 0 && (
                                              <Badge className="absolute -top-1 -right-1 px-1.5 text-xs h-5">
                                                {path.count}
                                              </Badge>
                                            )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{path.name}</p>
                </TooltipContent>
              </Tooltip>
            </li>
          ))}
          <li><ThemeToggle/></li>
          <li>
            <UserButton />
          </li>
        </ul>
      </nav>
    </Card>
  );
};

export default MobileNav;
