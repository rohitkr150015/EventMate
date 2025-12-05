import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home,
  Calendar,
  Users,
  DollarSign,
  Building2,
  Settings,
  LogOut,
  ChevronUp,
  Sparkles,
  Plus,
  LayoutDashboard,
  Store,
  Shield
} from "lucide-react";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "My Events", url: "/events", icon: Calendar },
  { title: "Vendors", url: "/vendors", icon: Building2 },
  { title: "Calendar", url: "/calendar", icon: LayoutDashboard },
  { title: "Budget", url: "/budget", icon: DollarSign },
];

const vendorNavItems = [
  { title: "Vendor Dashboard", url: "/vendor", icon: Store },
];

const adminNavItems = [
  { title: "Admin Panel", url: "/admin", icon: Shield },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isVendor = user?.role === "vendor" || user?.role === "admin";
  const isAdmin = user?.role === "admin";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">EventMate</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Quick Action */}
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <Link href="/events/new">
              <Button className="w-full gap-2" data-testid="button-sidebar-new-event">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </Link>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url || (item.url !== "/" && location.startsWith(item.url))}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Vendor Section */}
        {isVendor && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Vendor</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {vendorNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full" data-testid="button-user-menu">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {user?.firstName?.[0] || user?.email?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left truncate">
                    {user?.firstName || user?.email?.split("@")[0] || "User"}
                  </span>
                  <ChevronUp className="w-4 h-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={async () => {
                    try {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}
                  className="text-destructive cursor-pointer"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
