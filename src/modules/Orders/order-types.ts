export interface Order {
  id: number;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  status: string;
  date: string;
  paymentId: string | null;
  gatewayOrderId: string | null;
}
