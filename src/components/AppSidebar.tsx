// Navigation sidebar, listing main menu links and user panel.
"use client";

import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Building2,
  LogOut,
  Settings,
  Newspaper,
  UserCircle,
  User,
  EllipsisVertical,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
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
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { getCurrentUser, logout } from "@/services/auth"; // <-- Add these in your auth.ts
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageToggleButton } from "./LanguageToggleButton";
// import { NavUser } from "@/components/NavUser";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const dashboard = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
];
const catalogManagement = [
  {
    title: "Categories",
    url: "/categories",
    icon: Building2,
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Warehouse,
  },
];

const customerOperations = [
  {
    title: "Enquiries",
    url: "/enquiries",
    icon: Newspaper,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: UserCircle,
  },
  // {
  //   title: "Orders",
  //   url: "/orders",
  //   icon: ShoppingCart,
  // },
];

const navSecondary = [
  {
    title: "Users",
    url: "users",
    icon: User,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  // {
  //   title: "Get Help",
  //   url: "#",
  //   icon: HelpCircle,
  // },
];

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const { isMobile } = useSidebar();

  useEffect(() => {
    // Fetch current user info from auth
    getCurrentUser().then(setUser);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  // function to render sidebar menu items
  function renderSidebarMenuItems(
    type: string,
    items: Array<{ title: string; url: string; icon: React.ElementType }>
  ) {
    return (
      <>
        <SidebarGroupLabel>{t(type)}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.url}
                >
                  <Link to={item.url}>
                    <item.icon />
                    <span>{t(item.title)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </>
    );
  }

  return (
    <Sidebar>
      <SidebarHeader className="bg-gray-900 text-white">
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="font-semibold text-lg">
            {"Parashwanath ERP&CRM"}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-gray-100">
        <SidebarGroup>
          {renderSidebarMenuItems("Dashboard", dashboard)}
          {renderSidebarMenuItems("Store Management", catalogManagement)}
          {renderSidebarMenuItems("CRM & Sales", customerOperations)}
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          {renderSidebarMenuItems("", navSecondary)}
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <User />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <User />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User />
                {t("Account")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Info />
                {t("Notifications")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LanguageToggleButton />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 flex items-center gap-2 text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {t("Logout")}
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
