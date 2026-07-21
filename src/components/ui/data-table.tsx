import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type PaginationState,
    type Row,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type DataTableState = {
    sorting?: SortingState;
    columnFilters?: ColumnFiltersState;
    pagination?: PaginationState;
    rowSelection?: RowSelectionState;
    columnVisibility?: VisibilityState;
};

export type DataTableEmptyState = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
    content?: React.ReactNode;
    message?: React.ReactNode;
};

export type DataTableSearchConfig = {
    key?: string;
    placeholder?: string;
};

export type DataTableBehaviorConfig = {
    manualPagination?: boolean;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    enableColumnVisibility?: boolean;
};

export type DataTableConfig = {
    search?: DataTableSearchConfig;
    emptyState?: DataTableEmptyState;
    behavior?: DataTableBehaviorConfig;
};

export type DataTableProps<TData> = {
    data: TData[];
    columns: ColumnDef<TData, any>[];
    pageCount?: number;
    totalRows?: number;
    isLoading?: boolean;
    emptyMessage?: React.ReactNode;
    emptyState?: DataTableEmptyState;
    emptyStateTitle?: React.ReactNode;
    emptyStateDescription?: React.ReactNode;
    emptyStateAction?: React.ReactNode;
    searchPlaceholder?: string;
    searchKey?: string;
    state?: DataTableState;
    onStateChange?: (state: DataTableState) => void;
    manualPagination?: boolean;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    getRowId?: (row: TData, index: number) => string;
    renderSubComponent?: (row: Row<TData>) => React.ReactNode;
    enableSelection?: boolean;
    enableColumnVisibility?: boolean;
    className?: string;
    tableConfig?: DataTableConfig;
};

export function DataTable<TData>({
    data,
    columns,
    pageCount,
    totalRows,
    isLoading,
    emptyMessage = "No rows found",
    emptyState,
    emptyStateTitle,
    emptyStateDescription,
    emptyStateAction,
    searchPlaceholder = "Search...",
    searchKey,
    tableConfig,
    state,
    onStateChange,
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
    getRowId,
    renderSubComponent,
    enableColumnVisibility = false,
    className,
}: DataTableProps<TData>) {
    const effectiveBehavior = tableConfig?.behavior ?? {};
    const effectiveSearch = tableConfig?.search ?? {};
    const effectiveEmptyState = tableConfig?.emptyState ?? emptyState;

    const effectiveManualPagination = effectiveBehavior.manualPagination ?? manualPagination;
    const effectiveManualSorting = effectiveBehavior.manualSorting ?? manualSorting;
    const effectiveManualFiltering = effectiveBehavior.manualFiltering ?? manualFiltering;
    const effectiveEnableColumnVisibility = effectiveBehavior.enableColumnVisibility ?? enableColumnVisibility;
    const effectiveSearchKey = effectiveSearch.key ?? searchKey;
    const effectiveSearchPlaceholder = effectiveSearch.placeholder ?? searchPlaceholder;
    const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
    const [internalColumnFilters, setInternalColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [internalPagination, setInternalPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const [internalRowSelection, setInternalRowSelection] = React.useState<RowSelectionState>({});
    const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({});

    const sorting = state?.sorting ?? internalSorting;
    const columnFilters = state?.columnFilters ?? internalColumnFilters;
    const pagination = state?.pagination ?? internalPagination;
    const rowSelection = state?.rowSelection ?? internalRowSelection;
    const columnVisibility = state?.columnVisibility ?? internalColumnVisibility;

    const table = useReactTable<TData>({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            pagination,
            rowSelection,
            columnVisibility,
        },
        manualPagination: effectiveManualPagination,
        manualSorting: effectiveManualSorting,
        manualFiltering: effectiveManualFiltering,
        pageCount: pageCount ?? -1,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: (updater) => {
            const next = typeof updater === "function" ? updater(sorting) : updater;
            if (onStateChange) {
                onStateChange({ sorting: next, columnFilters, pagination, rowSelection, columnVisibility });
            } else {
                setInternalSorting(next);
            }
        },
        onColumnFiltersChange: (updater) => {
            const next = typeof updater === "function" ? updater(columnFilters) : updater;
            if (onStateChange) {
                onStateChange({ sorting, columnFilters: next, pagination, rowSelection, columnVisibility });
            } else {
                setInternalColumnFilters(next);
            }
        },
        onPaginationChange: (updater) => {
            const next = typeof updater === "function" ? updater(pagination) : updater;
            if (onStateChange) {
                onStateChange({ sorting, columnFilters, pagination: next, rowSelection, columnVisibility });
            } else {
                setInternalPagination(next);
            }
        },
        onRowSelectionChange: (updater) => {
            const next = typeof updater === "function" ? updater(rowSelection) : updater;
            if (onStateChange) {
                onStateChange({ sorting, columnFilters, pagination, rowSelection: next, columnVisibility });
            } else {
                setInternalRowSelection(next);
            }
        },
        onColumnVisibilityChange: (updater) => {
            const next = typeof updater === "function" ? updater(columnVisibility) : updater;
            if (onStateChange) {
                onStateChange({ sorting, columnFilters, pagination, rowSelection, columnVisibility: next });
            } else {
                setInternalColumnVisibility(next);
            }
        },
        getRowId,
    });

    const searchValue = React.useMemo(() => {
        const searchFilter = columnFilters.find((filter) => filter.id === effectiveSearchKey);
        return (searchFilter?.value as string) ?? "";
    }, [columnFilters, effectiveSearchKey]);

    const handleSearchChange = (value: string) => {
        const nextFilters = columnFilters.filter((filter) => filter.id !== effectiveSearchKey);
        if (value) {
            nextFilters.push({ id: effectiveSearchKey ?? "", value });
        }
        if (onStateChange) {
            onStateChange({ sorting, columnFilters: nextFilters, pagination, rowSelection, columnVisibility });
        } else {
            setInternalColumnFilters(nextFilters);
        }
    };

    return (
        <div className={`flex flex-col gap-3 ${className ?? ""}`.trim()}>
            {effectiveSearchKey && (
                <div className="flex items-center justify-end">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={effectiveSearchPlaceholder}
                            value={searchValue}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            className="h-9 w-full rounded-md border border-border/60 bg-background pl-9 shadow-none"
                        />
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading...</div>
                    ) : table.getRowModel().rows.length === 0 ? (
                        effectiveEmptyState?.content ? (
                            <div className="px-4 py-16">{effectiveEmptyState.content}</div>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                                <p className="text-sm font-medium text-foreground">{effectiveEmptyState?.title ?? emptyStateTitle ?? "No data found"}</p>
                                <p className="mt-2 max-w-sm text-sm text-muted-foreground">{effectiveEmptyState?.description ?? emptyStateDescription ?? effectiveEmptyState?.message ?? emptyMessage}</p>
                                {effectiveEmptyState?.action ?? emptyStateAction ? <div className="mt-4">{effectiveEmptyState?.action ?? emptyStateAction}</div> : null}
                            </div>
                        )
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <tr key={headerGroup.id} className="border-b border-border/60 bg-muted/30">
                                        {headerGroup.headers.map((header) => (
                                            <th key={header.id} className="h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {table.getRowModel().rows.map((row, idx) => (
                                    <React.Fragment key={row.id}>
                                        <tr className={`transition-colors hover:bg-muted/40 ${idx % 2 === 0 ? "bg-background/70" : "bg-muted/20"}`}>
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="h-14 px-4 py-2">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                        {renderSubComponent && row.getIsExpanded() ? (
                                            <tr>
                                                <td colSpan={row.getVisibleCells().length} className="p-0">
                                                    {renderSubComponent(row)}
                                                </td>
                                            </tr>
                                        ) : null}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {pageCount && pageCount > 1 ? (
                    <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3">
                        <div className="text-xs text-muted-foreground">
                            Showing <span className="font-medium">{table.getRowModel().rows.length}</span> of{" "}
                            <span className="font-medium">{totalRows ?? data.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                                className="h-8 px-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs font-medium text-muted-foreground min-w-[4rem] text-center">
                                Page {table.getState().pagination.pageIndex + 1} of {pageCount}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                                className="h-8 px-2"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
