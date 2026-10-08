"use client";

import { renderMedia } from "@commons/utils/renderMedia";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { useLogout } from "@hooks/use-logout";
import { useAppSelector } from "@stores/index";
import { userInfoSelector } from "@stores/reducers/auth";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export function ProfileDropdown() {
  const { data: userInfo } = useAppSelector(userInfoSelector);
  const { logout } = useLogout();

  const initials =
    userInfo?.fullname
      ?.split(" ")
      .map((name: string) => name[0])
      .join("") || "U";

  const isLoggedIn = useMemo(() => userInfo?.id, [userInfo]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-[32px] w-[32px] rounded-full">
          <Avatar className="h-[32px] w-[32px] flex items-center justify-center">
            {isLoggedIn && userInfo?.avatar ? (
              <Image src={renderMedia(userInfo?.avatar)} alt="User" width={48} height={48} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {isLoggedIn ? (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none font-medium">{userInfo?.fullname}</p>
                <p className="text-muted-foreground text-xs leading-none">{userInfo?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/signin">Signin</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
