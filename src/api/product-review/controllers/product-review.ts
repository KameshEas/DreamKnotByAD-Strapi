import { factories } from '@strapi/strapi';

export default {
  async create(ctx: any) {
    const { product, rating, title, review_text, pros, cons, verified_purchase } = ctx.request.body;
    const customer = ctx.state.user;

    if (!customer) {
      return ctx.badRequest('Authentication required');
    }

    if (!product || !rating || !title || !review_text) {
      return ctx.badRequest('Missing required fields');
    }

    if (rating < 1 || rating > 5) {
      return ctx.badRequest('Rating must be between 1 and 5');
    }

    try {
      const review = await strapi.service('api::product-review.product-review').createReview({
        product,
        customer: customer.id,
        rating,
        title,
        review_text,
        pros,
        cons,
        verified_purchase
      });

      ctx.send({
        data: review,
        message: 'Review submitted successfully. Awaiting approval.'
      });
    } catch (error) {
      ctx.badRequest(error.message);
    }
  },

  async approve(ctx: any) {
    const { id } = ctx.params;
    const review = await strapi.service('api::product-review.product-review').approveReview(id);
    ctx.send({ data: review, message: 'Review approved successfully' });
  },

  async reject(ctx: any) {
    const { id } = ctx.params;
    const review = await strapi.service('api::product-review.product-review').rejectReview(id);
    ctx.send({ data: review, message: 'Review rejected successfully' });
  },

  async findByProduct(ctx: any) {
    const { id } = ctx.params;
    const { page, pageSize, sortBy, sortOrder } = ctx.query;

    const result = await strapi.service('api::product-review.product-review').getReviewsForProduct(id, {
      page,
      pageSize,
      sortBy,
      sortOrder
    });

    ctx.send(result);
  }
};
