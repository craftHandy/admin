import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiResponse } from "@/utils/interface";
import type { Order, OrderDetail, OrderStatus } from "./order-types";

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

type EditableOrder = Pick<Order, "id" | "status"> & { trackingNumber?: string | null };

type OrderEditDialogProps = {
  order: EditableOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderEditDialog({ order, open, onOpenChange }: OrderEditDialogProps) {
  const queryClient = useQueryClient();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const { data: orderResponse } = useQuery<ApiResponse<OrderDetail>>({
    queryKey: ["order", String(order?.id)],
    enabled: open && Boolean(order?.id),
    queryFn: async () => (await api.get(`/api/v1/admin/orders/${order?.id}`)).data,
  });
  const currentOrder = orderResponse?.data ?? order;

  useEffect(() => {
    if (open && currentOrder) {
      setTrackingNumber(currentOrder.trackingNumber ?? "");
      setStatus(ORDER_STATUSES.includes(currentOrder.status as OrderStatus) ? currentOrder.status as OrderStatus : "PENDING");
    }
  }, [open, currentOrder]);

  const mutation = useMutation({
    mutationFn: async (payload: { trackingNumber: string | null; status: OrderStatus }) =>
      (await api.put(`/api/v1/admin/orders/${order?.id}`, payload)).data,
    onSuccess: () => {
      toast.success("Order updated successfully");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", String(order?.id)] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || error?.message || "Failed to update order"),
  });

  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[1px]" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border-0 bg-card p-6 shadow-2xl shadow-slate-950/15">
        <div className="flex items-start justify-between gap-4"><div><Dialog.Title className="text-lg font-semibold">Edit order</Dialog.Title><Dialog.Description className="mt-1 text-sm text-muted-foreground">Update the order status and tracking number.</Dialog.Description></div><Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Close"><X className="h-4 w-4" /></Button></Dialog.Close></div>
        <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate({ trackingNumber: trackingNumber.trim() || null, status }); }}>
          <label className="block space-y-2 text-sm font-medium">Order status<select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30">{ORDER_STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="block space-y-2 text-sm font-medium">Tracking number<Input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="TRK-123456789" /></label>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update order</Button></div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
