"use client";
import { usePathname } from "next/navigation";
import { Box, Container, HardDrive, Home, Network } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const navItems = [
    { title: "Dashboard", icon: Home, href: "/", key: "/" },
    {
      title: "Containers",
      icon: Container,
      href: "/containers",
      key: "/containers",
    },
    { title: "Images", icon: Box, href: "/images", key: "/images" },
    { title: "Volumes", icon: HardDrive, href: "/volumes", key: "/volumes" },
    { title: "Networks", icon: Network, href: "/networks", key: "/networks" },
  ];

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-8">
        <div className="flex items-center gap-3">
          <Container className="h-10 w-10 text-blue-500" />
          <span className="text-2xl font-bold text-gray-800">Docker</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-sm uppercase tracking-wider font-medium mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.key}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 py-3 px-4 text-base font-medium"
                  >
                    <a href={item.href} className="flex items-center gap-4">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
