export default {
  routes: [
    {
      method: 'POST',
      path: '/product-reviews',
      handler: 'product-review.create',
      config: {
        policies: ['global::isAuthenticated'],
      },
    },
    {
      method: 'GET',
      path: '/product-reviews/product/:id',
      handler: 'product-review.findByProduct',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/product-reviews/:id/approve',
      handler: 'product-review.approve',
      config: {
        policies: ['global::isAdmin'],
      },
    },
    {
      method: 'PUT',
      path: '/product-reviews/:id/reject',
      handler: 'product-review.reject',
      config: {
        policies: ['global::isAdmin'],
      },
    },
  ],
};
