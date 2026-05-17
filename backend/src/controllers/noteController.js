import Note from '../models/Note.js';
import Activity from '../models/Activity.js';
import { v4 as uuidv4 } from 'uuid';

// Helper to log activity
const logActivity = async (userId, actionType, noteId, details = {}) => {
  await Activity.create({ userId, actionType, noteId, details });
};

// @desc    Get all notes for a user (with filtering)
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const { search, category, tag, isArchived, isPinned } = req.query;
    
    let query = { userId: req.user.id };

    if (isArchived !== undefined) {
      query.isArchived = isArchived === 'true';
    } else {
      query.isArchived = false; // default to non-archived
    }

    if (isPinned !== undefined) query.isPinned = isPinned === 'true';
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res) => {
  try {
    const { title, content, tags, category, color } = req.body;

    const note = await Note.create({
      userId: req.user.id,
      title: title || 'Untitled Note',
      content: content || '',
      tags: tags || [],
      category: category || 'General',
      color: color || '#ffffff',
    });

    await logActivity(req.user.id, 'CREATE_NOTE', note._id);

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a note (auto-save supports this)
// @route   PATCH /api/notes/:id
// @access  Private
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // We might not want to log EVERY edit if they type fast, but maybe for significant saves.
    // For now, we'll log it. In a real app, debounce this on the backend or frontend.
    await logActivity(req.user.id, 'EDIT_NOTE', note._id);

    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.status(200).json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle archive status
// @route   PATCH /api/notes/:id/archive
// @access  Private
export const toggleArchive = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isArchived = !note.isArchived;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/pin
// @access  Private
export const togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle favorite status
// @route   PATCH /api/notes/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    note.isFavorite = !note.isFavorite;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
