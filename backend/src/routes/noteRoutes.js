import express from 'express';
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  toggleArchive,
  togglePin,
  toggleFavorite
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all note routes
router.use(protect);

router.route('/')
  .get(getNotes)
  .post(createNote);

router.route('/:id')
  .get(getNoteById)
  .patch(updateNote)
  .delete(deleteNote);

router.patch('/:id/archive', toggleArchive);
router.patch('/:id/pin', togglePin);
router.patch('/:id/favorite', toggleFavorite);

export default router;
