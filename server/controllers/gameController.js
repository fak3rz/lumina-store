const mlbbService = require('../services/mlbbService');

class GameController {
  async lookup(req, res) {
    try {
      const { userId, zoneId } = req.query;
      const result = await mlbbService.lookupUser(userId, zoneId);
      res.json(result);
    } catch (e) {
      if (e.message.includes('not configured')) {
        return res.status(501).json({ ok: false, error: e.message });
      }
      if (e.message.includes('required')) {
        return res.status(400).json({ ok: false, error: e.message });
      }
      return res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = new GameController();
