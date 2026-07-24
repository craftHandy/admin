import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Plus, Star, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableConfig, type DataTableState } from "@/components/ui/data-table";
import { TableActions, tableActionIcons } from "@/components/ui/table-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ColumnDef } from "@tanstack/react-table";
import type { ApiPaginatedResponse } from "@/utils/interface";

interface Image {
  fileId: number;
  alt: string;
  isPrimary: boolean;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  discountPercentage: number;
  description: string;
  materials: string[];
  craftType: string;
  origin: string;
  occasions: string[];
  height: number;
  width: number;
  depth: number;
  weight: number;
  stockStatus: string;
  featured: boolean;
  categoryId: number;
  collectionId: number;
  images: Image[];
}


export default function ProductList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [sortBy, setSortBy] = useState("id");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const [tableState, setTableState] = useState<DataTableState>({
    pagination: { pageIndex: 0, pageSize: size },
    sorting: [],
    columnFilters: [],
    rowSelection: {},
    columnVisibility: {},
  });

  const { data, isLoading, isError, error } = useQuery<ApiPaginatedResponse<Product[]>>({
    queryKey: ["products", page, size, sortBy, direction],
    queryFn: async () => {
      const response = await api.get("/api/v1/product", {
        params: {
          page,
          size,
          sortBy,
          direction,
        },
      });
      return response.data;
    },
  });
  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/v1/product/${id}`);
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete product");
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

  const products = data?.data?.content || [];

  const handleTableStateChange = (next: DataTableState) => {
    setTableState(next);
    if (next.pagination) {
      setPage(next.pagination.pageIndex);
    }
    if (next.sorting?.[0]) {
      setSortBy(next.sorting[0].id);
      setDirection(next.sorting[0].desc ? "desc" : "asc");
    }
  };

  const columns = useMemo<ColumnDef<Product, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.title}</span>
            <span className="text-xs text-muted-foreground font-normal">{row.original.slug}</span>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => <span className="font-semibold text-foreground">${row.original.price?.toFixed(2)}</span>,
      },
      {
        accessorKey: "discountPercentage",
        header: "Discount",
        cell: ({ row }) => row.original.discountPercentage > 0 ? (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
            {row.original.discountPercentage}% off
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60">-</span>
        ),
      },
      {
        accessorKey: "craftType",
        header: "Craft Type",
        cell: ({ row }) => <span className="capitalize">{row.original.craftType || "-"}</span>,
      },
      {
        accessorKey: "origin",
        header: "Origin",
        cell: ({ row }) => <span className="capitalize">{row.original.origin || "-"}</span>,
      },
      {
        accessorKey: "stockStatus",
        header: "Stock",
        cell: ({ row }) => (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${row.original.stockStatus?.toLowerCase() === "in_stock" || row.original.stockStatus?.toLowerCase() === "instock"
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-amber-500/10 text-amber-500"}`}>
            {row.original.stockStatus?.replace("_", " ") || "In Stock"}
          </span>
        ),
      },
      {
        accessorKey: "featured",
        header: "Featured",
        cell: ({ row }) => row.original.featured ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <Star className="h-4 w-4 text-muted-foreground/30" />,
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
                onClick: () => navigate(`/products/${row.original.id}`),
              },
              {
                label: "Edit",
                icon: tableActionIcons.edit,
                onClick: () => navigate(`/products/${row.original.id}/edit`),
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
    [deleteMutation.isPending]
  );

  const tableConfig = useMemo<DataTableConfig>(
    () => ({
      search: {
        key: "title",
        placeholder: "Search products by title, craft type, or origin...",
      },
      emptyState: {
        title: "No Products Found",
        description: tableState.columnFilters?.length
          ? "No products match your current filters."
          : "Start by creating your first product to see it listed here.",
        action: !tableState.columnFilters?.length ? (
          <Button onClick={() => navigate("/products/create")} variant="outline">
            Create Product
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your store products, pricing, and inventories.
          </p>
        </div>
        <Button
          onClick={() => navigate("/products/create")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading products...</p>
          </div>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3 rounded-lg border bg-card shadow-sm">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="font-semibold text-lg text-foreground">Error Loading Products</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {(error as any)?.response?.data?.message || error?.message || "There was a problem fetching the product list."}
          </p>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })}>
            Try Again
          </Button>
        </div>
      ) : (
        <DataTable
          data={products}
          columns={columns}
          pageCount={data?.data?.totalPages ?? 1}
          totalRows={data?.data?.totalElements ?? products.length}
          state={tableState}
          onStateChange={handleTableStateChange}
          tableConfig={tableConfig}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
