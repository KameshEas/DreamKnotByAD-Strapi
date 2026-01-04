import { factories } from '@strapi/strapi';

export default {
  async updateOrderStatus(orderId: string, newStatus: string, notes?: string) {
    const order = await strapi.db.query('api::order.order').findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Get current order history
    const orderHistory = order.order_history || [];
    const timestamp = new Date().toISOString();

    // Add new status update to history
    orderHistory.push({
      status: newStatus,
      timestamp: timestamp,
      notes: notes || `Status updated to ${newStatus}`
    });

    // Update order
    const updatedOrder = await strapi.entityService.update('api::order.order', orderId, {
      data: {
        order_status: newStatus as any,
        order_history: orderHistory,
        ...(newStatus === 'delivered' && { actual_delivery_date: new Date() })
      }
    });

    return updatedOrder;
  },

  async addTrackingInfo(orderId: string, trackingNumber: string, trackingUrl?: string, carrier?: string) {
    const order = await strapi.db.query('api::order.order').findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Get current order history
    const orderHistory = order.order_history || [];
    orderHistory.push({
      status: 'shipped',
      timestamp: new Date().toISOString(),
      notes: `Order shipped via ${carrier || 'carrier'}. Tracking number: ${trackingNumber}`
    });

    // Update order with tracking information and history
    const updatedOrder = await strapi.entityService.update('api::order.order', orderId, {
      data: {
        tracking_number: trackingNumber,
        tracking_status: 'shipped',
        order_status: 'shipped' as any,
        estimated_delivery_date: order.estimated_delivery_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        order_history: orderHistory
      }
    });

    return updatedOrder;
  },

  async getOrderByTrackingNumber(trackingNumber: string) {
    return await strapi.db.query('api::order.order').findOne({
      where: { tracking_number: trackingNumber },
      populate: {
        user: {
          select: ['username', 'email']
        },
        order_items: {
          populate: {
            product: {
              select: ['title', 'images']
            }
          }
        }
      }
    });
  },

  async getOrderTrackingHistory(orderId: string) {
    const order = await strapi.db.query('api::order.order').findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return {
      orderId: order.id,
      currentStatus: order.order_status,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      history: order.order_history || []
    };
  },

  async updatePaymentStatus(orderId: string, paymentStatus: string, transactionId?: string) {
    const order = await strapi.db.query('api::order.order').findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Get current order history
    const orderHistory = order.order_history || [];
    const timestamp = new Date().toISOString();

    // Add payment status update to history
    orderHistory.push({
      status: `payment_${paymentStatus}`,
      timestamp: timestamp,
      notes: `Payment status updated to ${paymentStatus}${transactionId ? ` (Transaction ID: ${transactionId})` : ''}`
    });

    // Update order
    const updatedOrder = await strapi.entityService.update('api::order.order', orderId, {
      data: {
        payment_status: paymentStatus as any,
        payment_transaction_id: transactionId || order.payment_transaction_id,
        order_history: orderHistory
      }
    });

    return updatedOrder;
  },

  async processRefund(orderId: string, refundAmount: number, reason?: string) {
    const order = await strapi.db.query('api::order.order').findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.payment_status !== 'paid') {
      throw new Error('Cannot process refund for unpaid order');
    }

    if (refundAmount > order.total_amount) {
      throw new Error('Refund amount cannot exceed order total');
    }

    // Get current order history
    const orderHistory = order.order_history || [];
    const timestamp = new Date().toISOString();

    // Add refund to history
    orderHistory.push({
      status: 'refunded',
      timestamp: timestamp,
      notes: `Order refunded. Amount: ${refundAmount}. Reason: ${reason || 'Not specified'}`
    });

    // Update order
    const updatedOrder = await strapi.entityService.update('api::order.order', orderId, {
      data: {
        payment_status: 'refunded' as any,
        order_status: 'refunded' as any,
        refunded_amount: refundAmount,
        refund_reason: reason,
        return_policy_applied: true,
        return_date: new Date(),
        order_history: orderHistory
      }
    });

    return updatedOrder;
  }
};
