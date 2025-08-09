"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser, SignOutButton } from "@clerk/nextjs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  LayoutDashboard,
  FileVideo,
  Plus,
  Palette,
  Sparkles,
  BarChart3,
  HelpCircle,
  Settings,
  User,
  LogOut,
} from "lucide-react"

// Navigation data matching the image
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: false,
    },
    {
      title: "Create New",
      url: "/dashboard",
      icon: Plus,
      isActive: false,
      badge: "New",
    },
  ],
  projects: [
    {
      title: "Travel Video #1",
      url: "/editor/1",
      icon: FileVideo,
      status: "completed",
    },
    {
      title: "Cooking Tutorial",
      url: "/editor/2",
      icon: FileVideo,
      status: "processing",
    },
    {
      title: "Product Review",
      url: "/editor/3",
      icon: FileVideo,
      status: "completed",
    },
  ],
  tools: [
    {
      title: "Templates",
      url: "/templates",
      icon: Palette,
      description: "Browse viral templates",
    },
    {
      title: "AI Generator",
      url: "/generate",
      icon: Sparkles,
      description: "Generate with AI",
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      description: "Track performance",
    },
  ],
  support: [
    {
      title: "Help Center",
      url: "/help",
      icon: HelpCircle,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()

  // Update active states based on current path
  const updatedNavMain = data.navMain.map((item) => ({
    ...item,
    isActive: pathname === item.url,
  }))

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">Mikael AI</span>
            <span className="text-xs text-gray-400">Video Creator</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {updatedNavMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={item.isActive}>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge className="ml-auto gradient-primary text-black text-xs">{item.badge}</Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Projects */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider">
            Recent Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.projects.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.status === "completed" && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        {item.status === "processing" && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider">AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.tools.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{item.title}</div>
                        {item.description && <div className="text-xs text-gray-400 truncate">{item.description}</div>}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Help & Support */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider">
            Help & Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.support.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-800/50">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center overflow-hidden">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || user.firstName || "User"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-black" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user?.fullName || user?.firstName || "User"}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress || "Pro Plan"}
                </div>
              </div>
              <SignOutButton>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700 p-1">
                  <LogOut className="w-4 h-4" />
                </Button>
              </SignOutButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
