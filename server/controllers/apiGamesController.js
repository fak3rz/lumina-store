const apiGamesService = require('../services/apiGamesService');

class ApiGamesController {
  async getAccountInfo(req, res) {
    try {
      const result = await apiGamesService.getAccountInfo();
      
      // Pass through the response from APIGames
      if (result.status === 1 || result.rc === 200) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error'
      });
    }
  }

  async checkUsername(req, res) {
    try {
      const { gameCode, userId, zoneId } = req.query;

      if (!gameCode || !userId) {
        return res.status(400).json({
          status: 0,
          message: 'Missing gameCode or userId parameter'
        });
      }

      const result = await apiGamesService.checkUsername(gameCode, userId, zoneId);

      if (result.status === 1 && result.data.is_valid) {
        res.json(result);
      } else {
        res.status(200).json(result); // Return actual API response for debugging/client handling
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error'
      });
    }
  }
}

module.exports = new ApiGamesController();