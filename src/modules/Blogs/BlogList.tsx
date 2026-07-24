import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableConfig, type DataTableState } from "@/components/ui/data-table";
import { TableActions, tableActionIcons } from "@/components/ui/table-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ColumnDef } from "@tanstack/react-table";
import type { ApiPaginatedResponse } from "@/utils/interface";

export interface TagInfo {
    id: number;
    name: string;
}

export interface BlogItem {
    id: number;
    title: string;
    slug?: string;
    coverImage?: string;
    excerpt?: string;
    tags?: TagInfo[];
    status?: string;
    createdDate?: string;
    modifiedDate?: string;
}

export default function BlogList() {
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

    const { data, isLoading, isError, error } = useQuery<ApiPaginatedResponse<BlogItem[]>>({
        queryKey: ["blogs", page, size],
        queryFn: async () => {
            const response = await api.get("/api/v1/admin/blog", {
                params: { page, size },
            });
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/v1/admin/blog/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete blog");
        },
    });

    const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

    const handleDelete = (id: number) => setDeleteTarget(id);
    const confirmDelete = () => {
        if (deleteTarget !== null) {
            deleteMutation.mutate(deleteTarget);
            setDeleteTarget(null);
        }
    };

    const blogs = data?.data?.content || [];

    const handleTableStateChange = (next: DataTableState) => {
        setTableState(next);
        if (next.pagination) {
            setPage(next.pagination.pageIndex);
        }
    };

    const columns = useMemo<ColumnDef<BlogItem, any>[]>(
        () => [

            { accessorKey: "title", header: "Title", cell: ({ row }) => <span className="font-medium text-foreground">{row.original.title}</span> },
            { accessorKey: "slug", header: "Slug", cell: ({ row }) => <span className="text-xs text-muted-foreground font-mono">{row.original.slug || "—"}</span> },
            { accessorKey: "excerpt", header: "Excerpt", cell: ({ row }) => <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">{row.original.excerpt || "—"}</span> },
            {
                accessorKey: "tags", header: "Tags", cell: ({ row }) => {
                    const tags = row.original.tags;
                    return tags?.length ? (
                        <span className="flex gap-1 flex-wrap">
                            {tags.map((t) => <span key={t.id} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{t.name}</span>)}
                        </span>
                    ) : <span className="text-muted-foreground text-xs">—</span>;
                },
            },
            {
                accessorKey: "status", header: "Status", cell: ({ row }) => {
                    const s = row.original.status;
                    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{s}</span>;
                },
            },
            {
                accessorKey: "createdDate", header: "Created", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.createdDate ? new Date(row.original.createdDate).toLocaleDateString() : "—"}</span>,
            },
            {
                id: "actions", header: "Actions", cell: ({ row }) => (
                    <TableActions actions={[
                        { label: "View", icon: tableActionIcons.view, onClick: () => navigate(`/blogs/${row.original.id}`) },
                        { label: "Edit", icon: tableActionIcons.edit, onClick: () => navigate(`/blogs/${row.original.id}/edit`) },
                        { label: "Delete", icon: tableActionIcons.delete, onClick: () => handleDelete(row.original.id), destructive: true },
                    ]} />
                ),
            },
        ], []
    );

    const tableConfig = useMemo<DataTableConfig>(() => ({
        search: { key: "title", placeholder: "Search blogs..." },
        emptyState: { title: "No Blogs Found", description: "Start by creating your first blog.", action: <Button onClick={() => navigate("/blogs/create")} variant="outline">Create Blog</Button> },
        behavior: { manualPagination: true, manualSorting: true, manualFiltering: true, enableColumnVisibility: true },
    }), [navigate]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Blogs</h1>
                    <p className="text-sm text-muted-foreground">Manage blog posts.</p>
                </div>
                <Button onClick={() => navigate("/blogs/create")}><Plus className="mr-2 h-4 w-4" />Create Blog</Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3 rounded-lg border bg-card shadow-sm">
                    <AlertCircle className="h-10 w-10 text-destructive" />
                    <h3 className="font-semibold text-lg">Error Loading Blogs</h3>
                    <p className="text-sm text-muted-foreground">{(error as any)?.response?.data?.message || error?.message || "There was a problem fetching the blog list."}</p>
                </div>
            ) : (
                <DataTable
                    data={blogs}
                    columns={columns}
                    pageCount={data?.data?.totalPages ?? 1}
                    totalRows={data?.data?.totalElements ?? blogs.length}
                    state={tableState}
                    onStateChange={handleTableStateChange}
                    tableConfig={tableConfig}
                />
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
                title="Delete Blog"
                description="Are you sure you want to delete this blog? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                loading={deleteMutation.isPending}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
