import express from 'express';
import { generateSummary, extractActionItems, suggestTitle, suggestTags } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/summarize', generateSummary);
router.post('/action-items', extractActionItems);
router.post('/suggest-title', suggestTitle);
router.post('/suggest-tags', suggestTags);

export default router;
