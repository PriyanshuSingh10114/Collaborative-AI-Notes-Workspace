import { GoogleGenAI } from '@google/genai';
import Activity from '../models/Activity.js';
import dotenv from 'dotenv';
dotenv.config();

// Ensure the API key from .env is used, ignoring any system-wide GOOGLE_API_KEY
if (process.env.GEMINI_API_KEY) {
  process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

// Helper to log AI usage
const logAIUsage = async (userId, noteId = null) => {
  await Activity.create({ userId, actionType: 'AI_GENERATION', noteId });
};

// @desc    Generate summary for a note
// @route   POST /api/ai/summarize
// @access  Private
export const generateSummary = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const prompt = `Summarize the following note into a concise, professional summary:\n\n${content}`;
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    await logAIUsage(req.user.id, noteId);
    res.status(200).json({ summary: response.text });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Extract action items
// @route   POST /api/ai/action-items
// @access  Private
export const extractActionItems = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const prompt = `Extract a list of actionable items (tasks, todos) from the following note. Return ONLY a JSON array of strings, nothing else. Note:\n\n${content}`;
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    // Parse the JSON array from response
    const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    let actionItems = [];
    try {
      actionItems = JSON.parse(text);
    } catch(e) {
      // Fallback if AI didn't return perfect JSON
      actionItems = text.split('\n').filter(line => line.trim().length > 0);
    }

    await logAIUsage(req.user.id, noteId);
    res.status(200).json({ actionItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suggest title
// @route   POST /api/ai/suggest-title
// @access  Private
export const suggestTitle = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const prompt = `Suggest a short, catchy, and descriptive title for the following note. Return ONLY the title string, no quotes.\n\n${content}`;
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    await logAIUsage(req.user.id, noteId);
    res.status(200).json({ title: response.text.trim() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Suggest tags
// @route   POST /api/ai/suggest-tags
// @access  Private
export const suggestTags = async (req, res) => {
  try {
    const { content, noteId } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const prompt = `Suggest up to 5 relevant tags for the following note. Return ONLY a JSON array of single-word lowercase strings. Note:\n\n${content}`;
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    
    const text = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    let tags = [];
    try {
      tags = JSON.parse(text);
    } catch(e) {
      tags = text.split(',').map(t => t.trim().toLowerCase());
    }

    await logAIUsage(req.user.id, noteId);
    res.status(200).json({ tags });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
