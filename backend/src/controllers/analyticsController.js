import Note from '../models/Note.js';
import Activity from '../models/Activity.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get note counts
    const totalNotes = await Note.countDocuments({ userId });
    const archivedNotes = await Note.countDocuments({ userId, isArchived: true });
    
    // Get AI generation count from Activity
    const aiGenerations = await Activity.countDocuments({ userId, actionType: 'AI_GENERATION' });

    // Category distribution
    const categoryDistribution = await Note.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Tag distribution
    const tagDistribution = await Note.aggregate([
      { $match: { userId: req.user._id } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Activity over last 7 days (weekly activity graph)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyActivity = await Activity.aggregate([
      { $match: { userId: req.user._id, createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      totalNotes,
      archivedNotes,
      aiGenerations,
      categoryDistribution: categoryDistribution.map(c => ({ name: c._id, value: c.count })),
      topTags: tagDistribution.map(t => ({ name: t._id, value: t.count })),
      weeklyActivity: weeklyActivity.map(a => ({ date: a._id, count: a.count }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
