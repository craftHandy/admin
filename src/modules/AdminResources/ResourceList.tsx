import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableConfig, type DataTableState } from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { type ColumnDef } from "@tanstack/react-table";
import { tableActionIcons, TableActions } from "@/components/ui/table-actions";
import { ResourceForm } from "./ResourceForm";

export interface ResourceItem {
    id: number;
    name: string;
}

type ResourceListProps = {
    resourceKey: string;
    resourceName: string;
    resourceLabel: string;
    resourceDescription: string;
    endpoint: string;
};

export function ResourceList({
    resourceKey,
    resourceName,
    resourceLabel,
    resourceDescription,
    endpoint,
}: ResourceListProps) {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null);
    const [tableState, setTableState] = useState<DataTableState>({
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [],
        columnFilters: [],
        rowSelection: {},
        columnVisibility: {},
    });

    const { data, isLoading, isError, error } = useQuery<ResourceItem[]>({
        queryKey: [resourceKey],
        queryFn: async () => {
            const response = await api.get(endpoint);
            return response.data?.data ?? response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`${endpoint}/${id}`);
        },
        onSuccess: () => {
            toast.success(`${resourceName} deleted successfully`);
            queryClient.invalidateQueries({ queryKey: [resourceKey] });
        },
        onError: (err: any) => {
            console.error(err);
            toast.error(err.response?.data?.message || `Failed to delete ${resourceName.toLowerCase()}`);
        },
    });

    const handleCreate = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item: ResourceItem) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = (item: ResourceItem) => {
        setDeleteTarget(item);
    };

    const confirmDelete = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.id);
        setDeleteTarget(null);
    };

    const columns = useMemo<ColumnDef<ResourceItem, any>[]>(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>,
            },
            {
                accessorKey: "name",
                header: resourceLabel,
                cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <TableActions
                        actions={[
                            {
                                label: "Edit",
                                icon: tableActionIcons.edit,
                                onClick: () => handleEdit(row.original),
                            },
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
        [resourceLabel, deleteMutation.isPending]
    );

    const tableConfig = useMemo<DataTableConfig>(
        () => ({
            search: {
                key: "name",
                placeholder: `Search ${resourceLabel.toLowerCase()}...`,
            },
            emptyState: {
                title: `No ${resourceLabel} Found`,
                description: tableState.columnFilters?.length
                    ? `No ${resourceLabel.toLowerCase()} match your current filters.`
                    : `Start by creating your first ${resourceLabel.toLowerCase()} to see it listed here.`,
                action: !tableState.columnFilters?.length ? (
                    <Button onClick={handleCreate} variant="outline">
                        Create {resourceName}
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
        [handleCreate, resourceLabel, resourceName, tableState.columnFilters?.length]
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{resourceName}</h1>
                    <p className="text-sm text-muted-foreground">{resourceDescription}</p>
                </div>
                <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create {resourceName}
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading {resourceLabel.toLowerCase()}...</p>
                    </div>
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3 rounded-lg border bg-card shadow-sm">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                    <h3 className="font-semibold text-lg text-foreground">Error Loading {resourceLabel}</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        {(error as any)?.response?.data?.message || error?.message || `There was a problem fetching the ${resourceLabel.toLowerCase()} list.`}
                    </p>
                    <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: [resourceKey] })}>
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
                    onStateChange={(next) => {
                        setTableState(next);
                        if (next.pagination) {
                            // keep internal pagination state updated for table controls
                        }
                    }}
                    tableConfig={tableConfig}
                />
            )}

            <ResourceForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                resourceName={resourceName}
                endpoint={endpoint}
                selectedItem={selectedItem}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: [resourceKey] })}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
                title={`Delete ${resourceName}`}
                description={`Are you sure you want to delete this ${resourceName.toLowerCase()}? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
