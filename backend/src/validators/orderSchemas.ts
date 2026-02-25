import { z } from 'zod';

export const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  }),
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, 'Cart cannot be empty'),
});

export const patchStatusSchema = z.object({
  status: z.enum(['ORDER_RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']),
});
