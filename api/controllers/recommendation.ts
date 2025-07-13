import { RequestHandler } from 'express';
import RecommendationService from '../services/recommendation';

class RecommendationController {
  constructor(private service: RecommendationService) {}

  getRecommendation: RequestHandler = async (req, res) => {
    try {
      const userDetails = req.body;
      
      // Basic validation
      if (!userDetails.age || !userDetails.income || userDetails.number_of_dependents === undefined || !userDetails.risk_tolerance) {
        res.status(400).json({ 
          error: 'Missing required fields: age, income, number_of_dependents, and risk_tolerance are required' 
        });
        return;
      }

      const recommendations = await this.service.getRecommendations(userDetails);
      res.json(recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to get recommendations' });
      }
    }
  };
}

export default RecommendationController;