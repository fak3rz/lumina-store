const orderService = require('../services/orderService');

class PaymentController {
  mockPayPage(req, res) {
    const id = req.query.orderId;
    if (!id) return res.status(400).send('orderId required');
    res.send(`<!doctype html><html><head><meta charset="utf-8"><title>Simulate Payment</title></head><body style="font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#0b1220;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh"><div style="background:#0f172a;padding:24px;border-radius:12px;"><h2>Simulate Payment</h2><p>Order: ${id}</p><button id="pay" style="background:#10b981;color:#fff;padding:10px;border-radius:6px;border:0">Simulate Success</button><script>document.getElementById('pay').addEventListener('click',async()=>{const r=await fetch('/api/webhook/payment',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderId:'${id}',status:'paid'})});const j=await r.json();alert('Webhook result:'+JSON.stringify(j));window.location='/';});</script></div></body></html>`);
  }

  async handleWebhook(req, res) {
    const body = req.body || {};
    const { orderId, status } = body;
    if (!orderId || !status) return res.status(400).json({ ok: false, error: 'orderId and status required' });
    
    // In production, verify signature here
    
    try {
      // Find order to ensure it exists
      await orderService.getOrder(orderId);
      const updated = await orderService.updateStatus(orderId, status);
      console.log(`[Webhook] Order ${orderId} updated to ${status}`);
      res.json({ ok: true, status: 'updated', order: updated });
    } catch (e) {
      if (e.message === 'order not found') {
        return res.status(404).json({ ok: false, error: 'Order not found' });
      }
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = new PaymentController();
