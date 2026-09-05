import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import {
    Plus,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableConfig, type DataTableState } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ColumnDef } from "@tanstack/react-table";
import type { ApiPaginatedResponse } from "@/utils/interface";
import { tableActionIcons, TableActions } from "@/components/ui/table-actions";

export interface Category {
    id: number;
    categoryName: string;
    categoryCode: string;
    description?: string;
    file?: string
}


export default function CategoryList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [tableState, setTableState] = useState<DataTableState>({
        pagination: { pageIndex: 0, pageSize: size },
        sorting: [],
        columnFilters: [],
        rowSelection: {},
        columnVisibility: {},
    });

    const { data, isLoading, isError, error } = useQuery<ApiPaginatedResponse<Category[]>>({
        queryKey: ["categories", page, size],
        queryFn: async () => {
            const response = await api.get("/api/v1/admin/category", {
                params: {
                    page,
                    size,
                },
            });
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/v1/admin/category/${id}`);
        },
        onSuccess: () => {
            toast.success("Category deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (err: any) => {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to delete category");
        },
    });



    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setDeleteTarget(id);
    };

    const confirmDelete = () => {
        if (deleteTarget !== null) {
            deleteMutation.mutate(deleteTarget);
            setDeleteTarget(null);
        }
    };

    const columns = useMemo<ColumnDef<Category, any>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>,
            },
            {
                accessorKey: "categoryName",
                header: "Category Name",
                cell: ({ row }) => <span className="font-medium text-foreground">{row.original.categoryName}</span>,
            },
            {
                accessorKey: "categoryCode",
                header: "Category Code",
                cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.categoryCode}</span>,
            },
            {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }) => <span className="text-muted-foreground">{row.original.description || "—"}</span>,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <TableActions
                        actions={[
                            {
                                label: "View",
                                icon: tableActionIcons.view,
                                onClick: () => navigate(`/categories/${row.original.id}`),
                            },
                            {
                                label: "Edit",
                                icon: tableActionIcons.edit,
                                onClick: () => navigate(`/categories/${row.original.id}/edit`),
                            },
                            {
                                label: "Delete",
                                icon: tableActionIcons.delete,
                                onClick: () => handleDelete(row.original.id),
                                destructive: true,
                                disabled: deleteMutation.isPending,
                            },
                        ]}
                    />
                ),
            },
        ],
        []
    );

    const tableConfig = useMemo<DataTableConfig>(
        () => ({
            search: {
                key: "categoryName",
                placeholder: "Search categories by name or code...",
            },
            emptyState: {
                title: "No Categories Found",
                description: tableState.columnFilters?.length
                    ? "No categories match your current filters."
                    : "Start by creating your first category to see it listed here.",
                action: !tableState.columnFilters?.length ? (
                    <Button onClick={() => navigate("/categories/create")} variant="outline">
                        Create Category
                    </Button>
                ) : null,
            },
            behavior: {
                manualPagination: true,
                manualSorting: true,
                manualFiltering: true,
                enableColumnVisibility: true,
            },
        }),
        [navigate, tableState.columnFilters?.length]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your product categories and codes.
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/categories/create")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Create Category
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading categories...</p>
                    </div>
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3 rounded-lg border bg-card shadow-sm">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                    <h3 className="font-semibold text-lg text-foreground">Error Loading Categories</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        {(error as any)?.response?.data?.message || error?.message || "There was a problem fetching the category list."}
                    </p>
                    <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["categories"] })}>
                        Try Again
                    </Button>
                </div>
            ) : (
                <DataTable
                    data={data?.data?.content ?? []}
                    columns={columns}
                    pageCount={data?.data?.totalPages ?? 1}
                    totalRows={data?.data?.totalElements ?? data?.data?.content?.length ?? 0}
                    state={tableState}
                    onStateChange={(next) => {
                        setTableState(next);
                        if (next.pagination) {
                            setPage(next.pagination.pageIndex);
                        }
                    }}
                    tableConfig={tableConfig}
                />
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Delete Category"
                description="Are you sure you want to delete this category? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
