const orderService = require('../services/orderService');

class OrderController {
  async create(req, res) {
    try {
      const order = await orderService.createOrder(req.body);
      res.json({ ok: true, order });
    } catch (e) {
      if (e.message.includes('required')) {
        return res.status(400).json({ ok: false, error: e.message });
      }
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  async get(req, res) {
    try {
      const order = await orderService.getOrder(req.params.id);
      res.json({ ok: true, order });
    } catch (e) {
      if (e.message === 'order not found') {
        return res.status(404).json({ ok: false, error: e.message });
      }
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = new OrderController();
