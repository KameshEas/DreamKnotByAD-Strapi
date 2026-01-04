import { factories } from '@strapi/strapi';

export default {
  async validateDiscountCode(code: string, orderData: any) {
    const discountCode = await strapi.db.query('api::discount-code.discount-code').findOne({
      where: {
        code: code.toUpperCase(),
        is_active: true
      },
      populate: {
        applies_to_products: true,
        applies_to_categories: true
      }
    });

    if (!discountCode) {
      throw new Error('Invalid discount code');
    }

    // Check if code has expired
    if (discountCode.valid_until && new Date() > new Date(discountCode.valid_until)) {
      throw new Error('Discount code has expired');
    }

    // Check if code has not started yet
    if (discountCode.valid_from && new Date() < new Date(discountCode.valid_from)) {
      throw new Error('Discount code is not yet active');
    }

    // Check usage limits
    if (discountCode.usage_limit && discountCode.usage_count >= discountCode.usage_limit) {
      throw new Error('Discount code usage limit exceeded');
    }

    // Check minimum order value
    if (discountCode.minimum_order_value && orderData.subtotal < discountCode.minimum_order_value) {
      throw new Error(`Minimum order value of ${discountCode.minimum_order_value} required`);
    }

    // Check if applies to specific products
    if (discountCode.applies_to === 'specific_products' && discountCode.applies_to_products.length > 0) {
      const productIds = orderData.order_items.map((item: any) => item.product.id);
      const validProductIds = discountCode.applies_to_products.map((p: any) => p.id);
      
      const hasValidProduct = productIds.some((id: any) => validProductIds.includes(id));
      if (!hasValidProduct) {
        throw new Error('Discount code does not apply to any products in your cart');
      }
    }

    // Check if applies to specific categories
    if (discountCode.applies_to === 'categories' && discountCode.applies_to_categories.length > 0) {
      const categoryIds = orderData.order_items.map((item: any) => item.product.category.id);
      const validCategoryIds = discountCode.applies_to_categories.map((c: any) => c.id);
      
      const hasValidCategory = categoryIds.some((id: any) => validCategoryIds.includes(id));
      if (!hasValidCategory) {
        throw new Error('Discount code does not apply to any categories in your cart');
      }
    }

    // Check if excludes sale items
    if (discountCode.exclude_sale_items) {
      const hasSaleItems = orderData.order_items.some((item: any) => 
        item.price < item.product.original_price
      );
      if (hasSaleItems) {
        throw new Error('Discount code cannot be applied to sale items');
      }
    }

    return discountCode;
  },

  async applyDiscount(discountCode: any, orderData: any) {
    let discountAmount = 0;
    let subtotal = orderData.subtotal;

    if (discountCode.discount_type === 'percentage') {
      discountAmount = (subtotal * discountCode.discount_value) / 100;
      
      // Apply maximum discount limit
      if (discountCode.maximum_discount && discountAmount > discountCode.maximum_discount) {
        discountAmount = discountCode.maximum_discount;
      }
    } else if (discountCode.discount_type === 'fixed_amount') {
      discountAmount = discountCode.discount_value;
      
      // Don't allow discount to exceed subtotal
      if (discountAmount > subtotal) {
        discountAmount = subtotal;
      }
    }

    // Update usage count
    await strapi.db.query('api::discount-code.discount-code').update({
      where: { id: discountCode.id },
      data: {
        usage_count: discountCode.usage_count + 1
      }
    });

    return {
      discountAmount,
      finalTotal: subtotal - discountAmount
    };
  },

  async checkCustomerUsageLimit(code: string, customerId: string) {
    const discountCode = await strapi.db.query('api::discount-code.discount-code').findOne({
      where: { code: code.toUpperCase() }
    });

    if (!discountCode || !discountCode.customer_limit) {
      return true;
    }

    const customerUsageCount = discountCode.customer_usage_count || {};
    const usageCount = customerUsageCount[customerId] || 0;

    if (usageCount >= discountCode.customer_limit) {
      throw new Error('Customer usage limit exceeded for this discount code');
    }

    return true;
  },

  async incrementCustomerUsage(code: string, customerId: string) {
    const discountCode = await strapi.db.query('api::discount-code.discount-code').findOne({
      where: { code: code.toUpperCase() }
    });

    if (!discountCode) {
      return;
    }

    const customerUsageCount = discountCode.customer_usage_count || {};
    customerUsageCount[customerId] = (customerUsageCount[customerId] || 0) + 1;

    await strapi.db.query('api::discount-code.discount-code').update({
      where: { id: discountCode.id },
      data: {
        customer_usage_count: customerUsageCount
      }
    });
  }
};
