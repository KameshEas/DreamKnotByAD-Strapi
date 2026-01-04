export default {
  routes: [
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
        policies: ['global::isAuthenticated'],
      },
    },
    {
      method: 'DELETE',
      path: '/discount-codes/:code/remove',
      handler: 'discount-code.remove',
      config: {
        policies: ['global::isAuthenticated'],
      },
    },
  ],
};
