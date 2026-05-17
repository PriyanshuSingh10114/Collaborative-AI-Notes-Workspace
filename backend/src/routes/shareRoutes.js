import express from 'express';
import { toggleShareNote, getSharedNote } from '../controllers/shareController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:noteId', protect, toggleShareNote);
router.get('/:shareId', getSharedNote); // Public route

export default router;
