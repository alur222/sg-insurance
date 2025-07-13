import { Router } from 'express';
import RecommendationRepo from '../repositories/recommendation';
import RecommendationService from '../services/recommendation';
import RecommendationController from '../controllers/recommendation';

const repo = new RecommendationRepo();
const service = new RecommendationService(repo);
const controller = new RecommendationController(service);

const router = Router();

router.post('/', controller.getRecommendation);

export default router;
