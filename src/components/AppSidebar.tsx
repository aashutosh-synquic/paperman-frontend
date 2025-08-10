// Navigation sidebar, listing main menu links and user panel.
"use client";

import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Building2,
  LogOut,
  User2,
  Settings,
  HelpCircle,
  Search,
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
} from "@/components/ui/sidebar";
import { getCurrentUser, logout } from "@/services/auth"; // <-- Add these in your auth.ts
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { LanguageToggleButton } from "./LanguageToggleButton";
import { NavSecondary } from "@/components/NavSecondary";
import { NavUser } from "@/components/NavUser";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
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
  // {
  //   title: "Customers",
  //   url: "/customers",
  //   icon: Users,
  // },
];

const navSecondary = [
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  {
    title: "Get Help",
    url: "#",
    icon: HelpCircle,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
];

export function AppSidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    // Fetch current user info from auth
    getCurrentUser().then(setUser);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Sidebar>
      <SidebarHeader className="bg-gray-800 text-white">
        <div className="flex items-center gap-2 px-4 py-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-semibold text-lg">{t("Admin Panel")}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("Navigation")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
        </SidebarGroup>
      </SidebarContent>
      <SidebarContent>
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
      {/* User Panel */}
      <div className="border-t px-4 py-3 flex flex-col gap-1 bg-muted">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <User2 className="h-5 w-5" />
            <div>
              <div className="font-medium text-sm">{user?.name || "User"}</div>
              <div className="text-xs text-muted-foreground">
                {user?.email || ""}
              </div>
            </div>
          </div>
          <LanguageToggleButton />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 flex items-center gap-2 text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {t("Logout")}
        </Button>
      </div>
    </Sidebar>
  );
}
