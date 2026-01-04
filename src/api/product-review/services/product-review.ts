import { factories } from '@strapi/strapi';

export default {
  async createReview(data: any) {
    const { product, customer, rating, title, review_text, pros, cons, verified_purchase } = data;

    // Check if customer already reviewed this product
    const existingReview = await strapi.db.query('api::product-review.product-review').findOne({
      where: {
        product,
        customer,
        status: 'approved'
      }
    });

    if (existingReview) {
      throw new Error('You have already reviewed this product');
    }

    // Create the review
    const review = await strapi.entityService.create('api::product-review.product-review' as any, {
      data: {
        product,
        customer,
        rating,
        title,
        review_text,
        pros,
        cons,
        verified_purchase,
        review_date: new Date().toISOString(),
        status: 'pending'
      }
    });

    // Update product average rating
    await this.updateProductRating(product);

    return review;
  },

  async approveReview(reviewId: string) {
    const review = await strapi.entityService.update('api::product-review.product-review' as any, reviewId, {
      data: {
        status: 'approved'
      }
    });

    // Update product average rating
    const productId = review.product && typeof review.product === 'object' ? review.product.id : review.product;
    if (productId) {
      await this.updateProductRating(productId);
    }

    return review;
  },

  async rejectReview(reviewId: string) {
    return await strapi.entityService.update('api::product-review.product-review' as any, reviewId, {
      data: {
        status: 'rejected'
      }
    });
  },

  async updateProductRating(productId: string) {
    const reviews = await strapi.db.query('api::product-review.product-review').findMany({
      where: {
        product: productId,
        status: 'approved'
      },
      select: ['rating']
    });

    if (reviews.length === 0) {
      await strapi.entityService.update('api::product.product' as any, productId, {
        data: {
          averageRating: 0,
          reviewCount: 0
        }
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await strapi.entityService.update('api::product.product' as any, productId, {
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: reviews.length
      }
    });
  },

  async getReviewsForProduct(productId: string, options: any = {}) {
    const { page = 1, pageSize = 10, sortBy = 'review_date', sortOrder = 'desc' } = options;

    const reviews = await strapi.db.query('api::product-review.product-review').findMany({
      where: {
        product: productId,
        status: 'approved'
      },
      populate: {
        customer: {
          select: ['username', 'email']
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    const total = await strapi.db.query('api::product-review.product-review').count({
      where: {
        product: productId,
        status: 'approved'
      }
    });

    return {
      reviews,
      pagination: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize)
      }
    };
  }
};
