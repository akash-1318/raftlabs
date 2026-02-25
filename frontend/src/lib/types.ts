export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
};

export type OrderStatus = 'ORDER_RECEIVED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

export type Order = {
  id: string;
  customer: { name: string; address: string; phone: string };
  items: Array<{ menuItemId: string; quantity: number; unitPrice: number; name: string }>;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{ status: OrderStatus; at: string }>;
};
