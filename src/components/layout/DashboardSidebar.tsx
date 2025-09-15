import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  BarChart3, 
  Calculator,
  GraduationCap,
  Award,
  FileText
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Data Mahasiswa", url: "/students", icon: Users },
  { title: "Kriteria Penilaian", url: "/criteria", icon: Target },
  { title: "Penilaian AHP", url: "/ahp", icon: Calculator },
  { title: "Perhitungan SAW", url: "/saw", icon: BarChart3 },
  { title: "Hasil & Ranking", url: "/results", icon: Award },
  { title: "Laporan", url: "/reports", icon: FileText },
];

export const DashboardSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sidebar-primary rounded-lg">
            <GraduationCap className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">SPK</h2>
              <p className="text-sm text-sidebar-foreground/70">Mahasiswa Berprestasi</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!collapsed && "Menu Utama"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Trigger untuk toggle sidebar */}
      <div className="p-2 border-t border-sidebar-border">
        <SidebarTrigger className="w-full" />
      </div>
    </Sidebar>
  );
};