import type { PropsWithChildren } from "react";
import { Link, useLocation } from "react-router-dom";

import AppSidebar from "@/shared/sidebar/AppSidebar";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const AppLayout = ({ children }: PropsWithChildren) => {
    const location = useLocation();

    const breadcrumbItems = location.pathname
        .split("/")
        .filter(Boolean);

    return (
        <SidebarProvider>
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Content */}
            <SidebarInset>
                {/* Header */}
                <header className="sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-border/70 bg-background/85 px-5 backdrop-blur-xl">
                    <SidebarTrigger />

                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbItems.length === 0 ? (
                                <BreadcrumbItem>
                                    <BreadcrumbLink>Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                            ) : (
                                breadcrumbItems.map((item, index) => {
                                    const path =
                                        "/" + breadcrumbItems.slice(0, index + 1).join("/");

                                    const label = item
                                        .replace(/-/g, " ")
                                        .replace(/\b\w/g, (char) => char.toUpperCase());

                                    const isLast = index === breadcrumbItems.length - 1;

                                    return (
                                        <BreadcrumbItem key={path}>
                                            {isLast ? (
                                                <BreadcrumbLink className="font-medium text-foreground">
                                                    {label}
                                                </BreadcrumbLink>
                                            ) : (
                                                <>
                                                    <BreadcrumbLink asChild>
                                                        <Link to={path}>{label}</Link>
                                                    </BreadcrumbLink>
                                                    <BreadcrumbSeparator />
                                                </>
                                            )}
                                        </BreadcrumbItem>
                                    );
                                })
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto bg-slate-50/70 p-4 md:p-6">
                    <main className="mx-auto w-full max-w-7xl">{children}</main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AppLayout;
