import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableConfig, type DataTableState } from "@/components/ui/data-table";
import { TableActions, tableActionIcons } from "@/components/ui/table-actions";
import type { ApiPaginatedResponse } from "@/utils/interface";
import type { Order } from "./order-types";

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const badgeClass = (value: string) => {
  const normalized = value?.toUpperCase();
  if (["PAID", "COMPLETED", "DELIVERED", "SUCCESS"].includes(normalized)) return "bg-emerald-500/10 text-emerald-600";
  if (["FAILED", "CANCELLED", "REFUNDED"].includes(normalized)) return "bg-red-500/10 text-red-600";
  return "bg-amber-500/10 text-amber-600";
};

export default function OrderList() {
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

  const { data, isLoading, isError, error } = useQuery<ApiPaginatedResponse<Order[]>>({
    queryKey: ["orders", page, size, sortBy, direction],
    queryFn: async () => {
      const response = await api.get("/api/v1/admin/orders/list", {
        params: { page, size, sortBy, direction },
      });
      return response.data;
    },
  });

  const orders = data?.data?.content ?? [];

  const handleTableStateChange = (next: DataTableState) => {
    setTableState(next);
    if (next.pagination) setPage(next.pagination.pageIndex);
    if (next.sorting?.[0]) {
      setSortBy(next.sorting[0].id);
      setDirection(next.sorting[0].desc ? "desc" : "asc");
    }
  };

  const columns = useMemo<ColumnDef<Order, unknown>[]>(() => [
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => <span className="font-medium">{row.original.orderNumber}</span>,
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.original.customerName}</span>
          <span className="text-xs text-muted-foreground">{row.original.customerEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => <span className="font-medium">{formatAmount(row.original.totalAmount, row.original.currency)}</span>,
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass(row.original.paymentStatus)}`}>{row.original.paymentStatus}</span>,
    },
    {
      accessorKey: "status",
      header: "Order Status",
      cell: ({ row }) => <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass(row.original.status)}`}>{row.original.status}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <span>{new Date(row.original.date).toLocaleString()}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <TableActions actions={[{
          label: "View",
          icon: tableActionIcons.view,
          onClick: () => navigate(`/orders/${row.original.id}`, { state: { order: row.original } }),
        }]} />
      ),
    },
  ], [navigate]);

  const tableConfig = useMemo<DataTableConfig>(() => ({
    search: { key: "orderNumber", placeholder: "Search orders by order number..." },
    emptyState: {
      title: "No Orders Found",
      description: tableState.columnFilters?.length ? "No orders match your current filters." : "Orders will appear here once customers place them.",
    },
    behavior: { manualPagination: true, manualSorting: true, manualFiltering: true, enableColumnVisibility: true },
  }), [tableState.columnFilters?.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">View customer orders and their payment status.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /><p className="text-sm text-muted-foreground">Loading orders...</p></div></div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-card px-4 py-16 text-center shadow-sm">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold">Error Loading Orders</h3>
          <p className="max-w-md text-sm text-muted-foreground">{(error as any)?.response?.data?.message || error?.message || "There was a problem fetching the order list."}</p>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["orders"] })}>Try Again</Button>
        </div>
      ) : (
        <DataTable data={orders} columns={columns} pageCount={data?.data?.totalPages ?? 1} totalRows={data?.data?.totalElements ?? orders.length} state={tableState} onStateChange={handleTableStateChange} tableConfig={tableConfig} />
      )}
    </div>
  );
}
