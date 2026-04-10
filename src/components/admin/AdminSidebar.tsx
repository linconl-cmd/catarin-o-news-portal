import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Settings,
  BarChart3,
  Newspaper,
  Users,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const AdminSidebar = () => {
  const { hasRole, hasAnyRole, signOut, user } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const siteSettings = useSiteSettings();

  const menuItems = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["master", "tecnico", "editorial"] as const },
    { title: "Notícias", url: "/admin/posts", icon: FileText, roles: ["master", "tecnico", "editorial"] as const },
    { title: "Categorias", url: "/admin/categories", icon: FolderTree, roles: ["master", "tecnico", "editorial"] as const },
    { title: "Jornal Impresso", url: "/admin/print", icon: Newspaper, roles: ["master", "tecnico"] as const },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart3, roles: ["master", "tecnico"] as const },
    { title: "Utilizadores", url: "/admin/users", icon: Users, roles: ["master"] as const },
    { title: "Configurações", url: "/admin/settings", icon: Settings, roles: ["master", "tecnico"] as const },
  ];

  const visibleItems = menuItems.filter((item) =>
    hasAnyRole([...item.roles])
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (
              siteSettings.logo_url ? (
                <img
                  src={siteSettings.logo_url}
                  alt={siteSettings.site_name}
                  className="h-7 object-contain"
                />
              ) : (
                <span className="font-heading text-sm font-bold">
                  {siteSettings.site_name || "O CATARINÃO"}
                </span>
              )
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {!collapsed && (
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {user?.email}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Sair"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
