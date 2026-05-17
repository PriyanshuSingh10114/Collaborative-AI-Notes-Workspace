import Note from '../models/Note.js';
import { v4 as uuidv4 } from 'uuid';
import Activity from '../models/Activity.js';

// Helper to log activity
const logActivity = async (userId, actionType, noteId, details = {}) => {
  await Activity.create({ userId, actionType, noteId, details });
};

// @desc    Toggle public sharing for a note
// @route   POST /api/share/:noteId
// @access  Private
export const toggleShareNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.noteId, userId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.isPublic) {
      // Disable sharing
      note.isPublic = false;
      note.shareId = undefined; // Remove shareId
    } else {
      // Enable sharing
      note.isPublic = true;
      note.shareId = uuidv4();
      await logActivity(req.user.id, 'SHARE_NOTE', note._id);
    }

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a public note by shareId
// @route   GET /api/share/:shareId
// @access  Public
export const getSharedNote = async (req, res) => {
  try {
    const note = await Note.findOne({ shareId: req.params.shareId, isPublic: true })
                           .populate('userId', 'name avatar');
    
    if (!note) {
      return res.status(404).json({ message: 'Public note not found or sharing disabled' });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
