export default {
  routes: [
    // Standard CRUD routes
    {
      method: 'GET',
      path: '/discount-codes',
      handler: 'discount-code.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/discount-codes/:id',
      handler: 'discount-code.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/discount-codes',
      handler: 'discount-code.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/discount-codes/:id',
      handler: 'discount-code.update',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/discount-codes/:id',
      handler: 'discount-code.delete',
      config: {
        policies: [],
      },
    },
    // Custom routes
    {
      method: 'GET',
      path: '/discount-codes/:code/validate',
      handler: 'discount-code.validate',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/discount-codes/:code/apply',
      handler: 'discount-code.apply',
      config: {
        policies: [],
      },
    },
    {
      method: 'DELETE',
      path: '/discount-codes/:code/remove',
      handler: 'discount-code.remove',
      config: {
        policies: [],
      },
    },
  ],
};
