import { ArrowLeft, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Order } from "./order-types";

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const Detail = ({ label, value }: { label: string; value: string | number | null }) => (
  <div className="rounded-lg border bg-background/60 p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="mt-2 break-all font-medium text-foreground">{value ?? "—"}</p>
  </div>
);

export default function OrderView() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as { order?: Order } | null)?.order;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h1 className="text-lg font-semibold">Order details unavailable</h1>
        <p className="text-sm text-muted-foreground">Open the order from the Orders list to view its details.</p>
        <Button variant="outline" onClick={() => navigate("/orders")}>Back to Orders</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} className="h-9 w-9 rounded-full border"><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Order ID #{order.id} · {new Date(order.date).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Customer</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Name" value={order.customerName} />
            <Detail label="Email" value={order.customerEmail} />
          </div>
        </section>
        <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Order & payment</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Total amount" value={formatAmount(order.totalAmount, order.currency)} />
            <Detail label="Order status" value={order.status} />
            <Detail label="Payment status" value={order.paymentStatus} />
            <Detail label="Currency" value={order.currency} />
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="font-semibold">Gateway details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Detail label="Payment ID" value={order.paymentId} />
          <Detail label="Gateway order ID" value={order.gatewayOrderId} />
        </div>
      </section>
    </div>
  );
}
