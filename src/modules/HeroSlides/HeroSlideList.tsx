import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Plus, AlertCircle, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableConfig, type DataTableState } from "@/components/ui/data-table";
import { TableActions, tableActionIcons } from "@/components/ui/table-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ColumnDef } from "@tanstack/react-table";

export interface HeroSlideItem {
    id: number;
    title: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundImageUrl?: string | null;
    active: boolean;
    createdDate?: string;
    modifiedDate?: string;
}

export default function HeroSlideList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [tableState, setTableState] = useState<DataTableState>({
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [],
        columnFilters: [],
        rowSelection: {},
        columnVisibility: {},
    });

    const { data, isLoading, isError, error } = useQuery<HeroSlideItem[]>({
        queryKey: ["hero-slides"],
        queryFn: async () => {
            const response = await api.get("/api/v1/admin/hero-slide");
            return response.data?.data ?? response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/v1/admin/hero-slide/${id}`);
        },
        onSuccess: () => {
            toast.success("Hero slide deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
        },
        onError: (err: unknown) => {
            const apiError = err as { response?: { data?: { message?: string } } };
            toast.error(apiError.response?.data?.message || "Failed to delete hero slide");
        },
    });

    const [deleteTarget, setDeleteTarget] = useState<HeroSlideItem | null>(null);

    const handleDelete = (item: HeroSlideItem) => setDeleteTarget(item);
    const confirmDelete = () => {
        if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    const columns = useMemo<ColumnDef<HeroSlideItem, any>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>,
            },
            {
                accessorKey: "backgroundImageUrl",
                header: "Image",
                cell: ({ row }) => row.original.backgroundImageUrl ? (
                    <img
                        src={row.original.backgroundImageUrl}
                        alt={row.original.title}
                        className="h-10 w-16 rounded-md border border-border object-cover"
                    />
                ) : (
                    <span className="flex h-10 w-16 items-center justify-center rounded-md border border-border bg-muted/50">
                        <ImageOff className="h-4 w-4 text-muted-foreground/50" />
                    </span>
                ),
            },
            {
                accessorKey: "title",
                header: "Title",
                cell: ({ row }) => <span className="font-medium text-foreground">{row.original.title}</span>,
            },
            {
                accessorKey: "subtitle",
                header: "Subtitle",
                cell: ({ row }) => <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">{row.original.subtitle || "—"}</span>,
            },
            {
                accessorKey: "ctaText",
                header: "CTA",
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.ctaText ? (
                            <>
                                {row.original.ctaText}
                                {row.original.ctaLink && (
                                    <span className="ml-1 text-xs font-mono text-muted-foreground/70">→ {row.original.ctaLink}</span>
                                )}
                            </>
                        ) : (
                            "—"
                        )}
                    </span>
                ),
            },
            {
                accessorKey: "active",
                header: "Active",
                cell: ({ row }) => (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.original.active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {row.original.active ? "Active" : "Inactive"}
                    </span>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <TableActions
                        actions={[
                            { label: "View", icon: tableActionIcons.view, onClick: () => navigate(`/hero-slides/${row.original.id}`) },
                            { label: "Edit", icon: tableActionIcons.edit, onClick: () => navigate(`/hero-slides/${row.original.id}/edit`) },
                            {
                                label: "Delete",
                                icon: tableActionIcons.delete,
                                onClick: () => handleDelete(row.original),
                                destructive: true,
                                disabled: deleteMutation.isPending,
                            },
                        ]}
                    />
                ),
            },
        ],
        [deleteMutation.isPending, navigate]
    );

    const tableConfig = useMemo<DataTableConfig>(
        () => ({
            search: { key: "title", placeholder: "Search hero slides by title..." },
            emptyState: {
                title: "No Hero Slides Found",
                description: tableState.columnFilters?.length
                    ? "No hero slides match your current filters."
                    : "Start by creating your first hero slide to see it listed here.",
                action: !tableState.columnFilters?.length ? (
                    <Button onClick={() => navigate("/hero-slides/create")} variant="outline">
                        Create Hero Slide
                    </Button>
                ) : null,
            },
            behavior: {
                manualPagination: false,
                manualSorting: false,
                manualFiltering: false,
                enableColumnVisibility: true,
            },
        }),
        [navigate, tableState.columnFilters?.length]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Hero Slides</h1>
                    <p className="text-sm text-muted-foreground">Manage the hero slides shown on your homepage banner.</p>
                </div>
                <Button onClick={() => navigate("/hero-slides/create")} className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Hero Slide
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading hero slides...</p>
                    </div>
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3 rounded-lg border bg-card shadow-sm">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                    <h3 className="font-semibold text-lg text-foreground">Error Loading Hero Slides</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        {(error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                            error?.message ||
                            "There was a problem fetching the hero slide list."}
                    </p>
                    <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["hero-slides"] })}>
                        Try Again
                    </Button>
                </div>
            ) : (
                <DataTable
                    data={data ?? []}
                    columns={columns}
                    pageCount={1}
                    totalRows={data?.length ?? 0}
                    state={tableState}
                    onStateChange={setTableState}
                    tableConfig={tableConfig}
                />
            )}

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Delete Hero Slide"
                description="Are you sure you want to delete this hero slide? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
