import RecommendationRepo from '../repositories/recommendation';
import RecommendationService from '../services/recommendation';
import pool from '../config/database';

describe('RecommendationService', () => {
  const repo = new RecommendationRepo();
  const service = new RecommendationService(repo);

  afterAll(async () => {
    await pool.end();
  });

  it('get a recommendation', async () => {
    const result = await service.getRecommendations({
      age: 22,
      income: 35000,
      number_of_dependents: 2,
      risk_tolerance: 'medium'
    });
    
    expect(result).toHaveProperty('recommendation');
    
    // Check recommendation structure
    expect(result.recommendation).toHaveProperty('product');
    expect(result.recommendation).toHaveProperty('title');
    expect(result.recommendation).toHaveProperty('explanation');
    expect(typeof result.recommendation.title).toBe('string');
    expect(typeof result.recommendation.explanation).toBe('string');
  });
});
