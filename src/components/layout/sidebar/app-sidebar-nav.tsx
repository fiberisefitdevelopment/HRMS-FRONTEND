"use client";

import { useNavigation } from "@/hooks/use-navigation";
import { SidebarNav } from "./sidebar-nav";

interface AppSidebarNavProps {
  collapsed?: boolean;
}

export function AppSidebarNav({ collapsed }: AppSidebarNavProps) {
  const { items } = useNavigation();
  return <SidebarNav items={items} collapsed={collapsed} />;
}
