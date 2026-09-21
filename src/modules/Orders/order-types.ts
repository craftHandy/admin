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

export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
export interface OrderItem { id: number; productId: number; productName: string; productSlug: string; unitPrice: number; quantity: number; totalPrice: number; imageUrl: string | null; }
export interface ShippingAddress { fullName: string; mobileNo: string; addressLine1: string; addressLine2: string | null; city: string; state: string; country: string; postalCode: string; }
export interface PaymentDetail { gateway: string; gatewayOrderId: string | null; gatewayPaymentId: string | null; amount: number; currency: string; status: string; paymentMethod: string | null; }
export interface OrderDetail {
  id: number; orderNumber: string; trackingNumber: string | null; status: OrderStatus; subtotal: number; discount: number; tax: number; shippingCharge: number; totalAmount: number; currency: string; notes: string | null; createdDate: string; modifiedDate: string; userId: number; customerName: string; customerEmail: string; customerPhone: string | null; shippingAddress: ShippingAddress | null; items: OrderItem[]; payment: PaymentDetail | null;
}
