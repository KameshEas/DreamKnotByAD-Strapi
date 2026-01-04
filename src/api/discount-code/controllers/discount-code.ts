import { factories } from '@strapi/strapi';

export default {
  async validate(ctx: any) {
    const { code } = ctx.params;
    const { orderData } = ctx.request.body;

    if (!code) {
      return ctx.badRequest('Discount code is required');
    }

    try {
      const discountCode = await strapi.service('api::discount-code.discount-code').validateDiscountCode(code, orderData);
      
      ctx.send({
        valid: true,
        code: discountCode.code,
        name: discountCode.name,
        discount_type: discountCode.discount_type,
        discount_value: discountCode.discount_value,
        message: 'Discount code is valid'
      });
    } catch (error) {
      ctx.send({
        valid: false,
        message: error.message
      });
    }
  },

  async apply(ctx: any) {
    const { code } = ctx.params;
    const { orderData } = ctx.request.body;

    if (!code) {
      return ctx.badRequest('Discount code is required');
    }

    try {
      const discountCode = await strapi.service('api::discount-code.discount-code').validateDiscountCode(code, orderData);
      
      // Check customer usage limit
      const customer = ctx.state.user;
      if (customer) {
        await strapi.service('api::discount-code.discount-code').checkCustomerUsageLimit(code, customer.id);
      }

      const result = await strapi.service('api::discount-code.discount-code').applyDiscount(discountCode, orderData);
      
      // Increment customer usage
      if (customer) {
        await strapi.service('api::discount-code.discount-code').incrementCustomerUsage(code, customer.id);
      }

      ctx.send({
        success: true,
        discountAmount: result.discountAmount,
        finalTotal: result.finalTotal,
        message: 'Discount applied successfully'
      });
    } catch (error) {
      ctx.send({
        success: false,
        message: error.message
      });
    }
  },

  async remove(ctx: any) {
    const { code } = ctx.params;
    const { orderData } = ctx.request.body;

    if (!code) {
      return ctx.badRequest('Discount code is required');
    }

    try {
      // Decrement usage count if the code was previously applied
      const discountCode = await strapi.db.query('api::discount-code.discount-code').findOne({
        where: { code: code.toUpperCase() }
      });

      if (discountCode && discountCode.usage_count > 0) {
        await strapi.db.query('api::discount-code.discount-code').update({
          where: { id: discountCode.id },
          data: {
            usage_count: discountCode.usage_count - 1
          }
        });
      }

      ctx.send({
        success: true,
        message: 'Discount code removed successfully'
      });
    } catch (error) {
      ctx.send({
        success: false,
        message: error.message
      });
    }
  }
};
