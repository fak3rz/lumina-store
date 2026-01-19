const orderModel = require('../models/orderModel');

class OrderService {
  async createOrder(data) {
    const { userId, zoneId, sku, amount, price, paymentMethod } = data;
    if (!userId || !zoneId || !sku) {
      throw new Error('userId, zoneId and sku required');
    }
    
    const order = await orderModel.create({
      userId, zoneId, sku, amount, price, paymentMethod
    });
    
    // mock payment URL (local flow)
    order.paymentUrl = `/api/mock/pay?orderId=${encodeURIComponent(order.id)}`;
    await orderModel.update(order.id, { paymentUrl: order.paymentUrl });
    
    return order;
  }

  async getOrder(id) {
    const order = await orderModel.findById(id);
    if (!order) {
      throw new Error('order not found');
    }
    return order;
  }

  async updateStatus(id, status) {
    return await orderModel.update(id, { status });
  }
}

module.exports = new OrderService();
