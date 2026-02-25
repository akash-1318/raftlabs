export type OrderStatus =
  | 'ORDER_RECEIVED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export const ORDER_STATUSES: OrderStatus[] = [
  'ORDER_RECEIVED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number; // in smallest unit? for simplicity raw number
  image: string;
};

export type OrderItem = {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  name: string;
};

export type CustomerDetails = {
  name: string;
  address: string;
  phone: string;
};

export type Order = {
  id: string;
  customer: CustomerDetails;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{ status: OrderStatus; at: string }>;
};
