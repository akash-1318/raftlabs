import type { OpenAPIV3 } from 'openapi-types';

export const openapiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Order Management API',
    version: '1.0.0',
    description: 'REST API for menu retrieval, order placement, and order status tracking (with simulated real-time updates).',
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Local' },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Menu' },
    { name: 'Orders' },
  ],
  components: {
    schemas: {
      MenuItem: {
        type: 'object',
        required: ['id', 'name', 'description', 'price', 'image'],
        properties: {
          id: { type: 'string', example: '1' },
          name: { type: 'string', example: 'Margherita Pizza' },
          description: { type: 'string', example: 'Classic cheese pizza' },
          price: { type: 'number', example: 299 },
          image: { type: 'string', example: 'https://example.com/pizza.jpg' },
        },
      },
      OrderStatus: {
        type: 'string',
        enum: ['ORDER_RECEIVED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'],
      },
      OrderLineInput: {
        type: 'object',
        required: ['menuItemId', 'quantity'],
        properties: {
          menuItemId: { type: 'string', example: '1' },
          quantity: { type: 'integer', minimum: 1, example: 2 },
        },
      },
      CustomerInput: {
        type: 'object',
        required: ['name', 'address', 'phone'],
        properties: {
          name: { type: 'string', example: 'Tirth' },
          address: { type: 'string', example: 'Ahmedabad' },
          phone: { type: 'string', example: '9876543210', description: '10-digit phone number' },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['customer', 'items'],
        properties: {
          customer: { $ref: '#/components/schemas/CustomerInput' },
          items: {
            type: 'array',
            minItems: 1,
            items: { $ref: '#/components/schemas/OrderLineInput' },
          },
        },
      },
      CreateOrderResponse: {
        type: 'object',
        required: ['orderId', 'status'],
        properties: {
          orderId: { type: 'string', example: 'ORD-ABC123DEF4' },
          status: { $ref: '#/components/schemas/OrderStatus' },
        },
      },
      OrderLine: {
        type: 'object',
        required: ['menuItemId', 'quantity', 'unitPrice', 'name'],
        properties: {
          menuItemId: { type: 'string', example: '1' },
          quantity: { type: 'integer', example: 2 },
          unitPrice: { type: 'number', example: 299 },
          name: { type: 'string', example: 'Margherita Pizza' },
        },
      },
      OrderStatusHistory: {
        type: 'object',
        required: ['status', 'at'],
        properties: {
          status: { $ref: '#/components/schemas/OrderStatus' },
          at: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        required: ['id', 'customer', 'items', 'total', 'status', 'createdAt', 'updatedAt', 'statusHistory'],
        properties: {
          id: { type: 'string', example: 'ORD-ABC123DEF4' },
          customer: { $ref: '#/components/schemas/CustomerInput' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderLine' } },
          total: { type: 'number', example: 598 },
          status: { $ref: '#/components/schemas/OrderStatus' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          statusHistory: { type: 'array', items: { $ref: '#/components/schemas/OrderStatusHistory' } },
        },
      },
      PatchStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { $ref: '#/components/schemas/OrderStatus' },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['error', 'message'],
        properties: {
          error: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'Invalid request body' },
          details: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean', example: true } },
                },
              },
            },
          },
        },
      },
    },
    '/api/menu': {
      get: {
        tags: ['Menu'],
        summary: 'Get menu items',
        responses: {
          '200': {
            description: 'Menu list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/MenuItem' } },
              },
            },
          },
        },
      },
    },
    '/api/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Create an order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOrderRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateOrderResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Menu item not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get an order by id',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Order',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Order' } },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/api/orders/{id}/status': {
      patch: {
        tags: ['Orders'],
        summary: 'Update order status (admin/testing)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/PatchStatusRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Updated order',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Order' } },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
  },
};
