import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  Sidebar,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChevronDown,
  LayoutDashboard,
  Package,
  Tags,
  Tag,
  CalendarDays,
  Layers,
  FileText,
  MonitorPlay,
  Building2,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useLogout } from "@/hooks/use-logout";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const menuItems: any = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    children: [],
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    path: "/products",
    children: [],
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tags,
    path: "/categories",
    children: [],
  },
  {
    id: "tags",
    label: "Tag",
    icon: Tag,
    path: "/tags",
    children: [],
  },
  {
    id: "occasions",
    label: "Occasion",
    icon: CalendarDays,
    path: "/occasions",
    children: [],
  },
  {
    id: "materials",
    label: "Materials",
    icon: Layers,
    path: "/materials",
    children: [],
  },
  {
    id: "blogs",
    label: "Blogs",
    icon: FileText,
    path: "/blogs",
    children: [],
  },
  {
    id: "hero-slides",
    label: "Hero Slides",
    icon: MonitorPlay,
    path: "/hero-slides",
    children: [],
  },
];

function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const logout = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [openMenus, setOpenMenus] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    menuItems.forEach((item: any) => {
      if (item.children.some((child: any) => location.pathname === child.path)) {
        initial.add(item.id);
      }
    });
    return initial;
  });

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isActiveChild = (path: string) => location.pathname === path;
  const isActiveParent = (item: any) => {
    if (item.children.length === 0) return location.pathname === item.path;
    return item.children.some((child: any) => location.pathname === child.path);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-3 pb-3 pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="bg-transparent!">
                <Link to="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Building2 className="size-4" />
                  </div>
                  <span className="font-semibold tracking-tight">Ratnagiri Admin</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Separator className="bg-border/60" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu className="space-y-1.5! px-2">
            {menuItems.map((item: any) => {
              const Icon = item.icon;
              const hasChildren = item.children.length > 0;
              const isOpen = openMenus.has(item.id);
              const isActive = isActiveParent(item);

              if (!hasChildren) {
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link to={item.path} className="flex items-center gap-3">
                        <Icon className="size-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible key={item.id} open={isOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.label}
                        onClick={() => {
                          if (hasChildren && state === "collapsed") {
                            toggleMenu(item.id);
                            navigate(item.children[0]?.path);
                            return;
                          }
                          toggleMenu(item.id);
                        }}
                        isActive={isActive}
                        className="flex items-center gap-3"
                      >
                        <Icon className="size-5" />
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`ml-auto h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((child: any) => (
                        <SidebarMenuSubItem key={child.id}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActiveChild(child.path)}
                            className={isActiveChild(child.path) ? "bg-muted font-medium" : ""}
                          >
                            <Link to={child.path}>{child.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="flex items-center gap-3 text-destructive" onClick={() => setShowLogoutConfirm(true)}>
                <button className="flex items-center gap-3">
                  <LogOut className="size-5" />
                  <span>Logout</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Logout"
        description="Are you sure you want to log out?"
        confirmLabel="Logout"
        variant="destructive"
        onConfirm={() => { setShowLogoutConfirm(false); logout(); }}
      />
    </>
  );
}

export default AppSidebar;