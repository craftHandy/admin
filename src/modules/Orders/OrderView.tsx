import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertCircle, Loader2, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { ApiResponse } from "@/utils/interface";
import type { OrderDetail } from "./order-types";
import { OrderEditDialog } from "./OrderEditDialog";

const formatAmount = (amount: number, currency: string) => {
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount); }
  catch { return `${currency} ${amount.toLocaleString()}`; }
};
const formatDate = (date?: string) => date ? new Date(date).toLocaleString() : "—";
const Detail = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="rounded-lg border bg-background/60 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 break-all font-medium text-foreground">{value ?? "—"}</p></div>
);

export default function OrderView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { data, isLoading, isError, error } = useQuery<ApiResponse<OrderDetail>>({
    queryKey: ["order", id], enabled: Boolean(id),
    queryFn: async () => (await api.get(`/api/v1/admin/orders/${id}`)).data,
  });
  const order = data?.data;

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (isError || !order) return <div className="flex flex-col items-center justify-center gap-3 py-16 text-center"><AlertCircle className="h-10 w-10 text-destructive" /><h1 className="text-lg font-semibold">Order details unavailable</h1><p className="max-w-md text-sm text-muted-foreground">{(error as any)?.response?.data?.message || "There was a problem fetching this order."}</p><Button variant="outline" onClick={() => navigate("/orders")}>Back to Orders</Button></div>;
  const address = order.shippingAddress;

  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="h-9 w-9 rounded-full border" aria-label="Back to orders"><ArrowLeft className="h-4 w-4" /></Button><div><h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1><p className="text-sm text-muted-foreground">Order ID #{order.id} · {formatDate(order.createdDate)}</p></div></div><Button onClick={() => setIsEditOpen(true)}><Pencil className="mr-2 h-4 w-4" />Edit order</Button></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"><h2 className="font-semibold">Customer</h2><div className="grid gap-4 sm:grid-cols-2"><Detail label="Name" value={order.customerName} /><Detail label="Email" value={order.customerEmail} /><Detail label="Phone" value={order.customerPhone} /><Detail label="Customer ID" value={order.userId} /></div></section>
      <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"><h2 className="font-semibold">Order & payment</h2><div className="grid gap-4 sm:grid-cols-2"><Detail label="Total amount" value={formatAmount(order.totalAmount, order.currency)} /><Detail label="Order status" value={order.status} /><Detail label="Payment status" value={order.payment?.status} /><Detail label="Tracking number" value={order.trackingNumber} /></div></section>
    </div>
    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"><h2 className="font-semibold">Shipping address</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Detail label="Recipient" value={address?.fullName} /><Detail label="Mobile" value={address?.mobileNo} /><Detail label="Address" value={[address?.addressLine1, address?.addressLine2].filter(Boolean).join(", ")} /><Detail label="City / State" value={[address?.city, address?.state].filter(Boolean).join(", ")} /><Detail label="Country" value={address?.country} /><Detail label="Postal code" value={address?.postalCode} /></div></section>
    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"><h2 className="font-semibold">Items</h2><div className="overflow-x-auto rounded-lg border"><table className="w-full min-w-[650px] text-sm"><thead className="bg-muted/50 text-left text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium">Unit price</th><th className="px-4 py-3 font-medium">Quantity</th><th className="px-4 py-3 text-right font-medium">Total</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="border-t"><td className="px-4 py-3"><div className="flex items-center gap-3">{item.imageUrl && <img src={item.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />}<div><p className="font-medium">{item.productName}</p><p className="text-xs text-muted-foreground">{item.productSlug}</p></div></div></td><td className="px-4 py-3">{formatAmount(item.unitPrice, order.currency)}</td><td className="px-4 py-3">{item.quantity}</td><td className="px-4 py-3 text-right font-medium">{formatAmount(item.totalPrice, order.currency)}</td></tr>)}</tbody></table></div></section>
    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm"><h2 className="font-semibold">Gateway details</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Detail label="Gateway" value={order.payment?.gateway} /><Detail label="Payment ID" value={order.payment?.gatewayPaymentId} /><Detail label="Gateway order ID" value={order.payment?.gatewayOrderId} /><Detail label="Payment method" value={order.payment?.paymentMethod} /><Detail label="Paid amount" value={order.payment ? formatAmount(order.payment.amount, order.payment.currency) : null} /><Detail label="Notes" value={order.notes} /></div></section>
    <OrderEditDialog order={order} open={isEditOpen} onOpenChange={setIsEditOpen} />
  </div>;
}
