const Podcast = require('../models/Podcast');
const Episode = require('../models/Episode');
const Category = require('../models/Category');
const User = require('../models/User');
const path = require('path');

// ========== CREATOR DASHBOARD ==========

// GET /api/creator/dashboard
exports.getCreatorDashboard = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const [totalPodcasts, totalEpisodes, totalPlays, totalLikes, pendingEpisodes] = 
      await Promise.all([
        Podcast.countDocuments({ creatorId }),
        Episode.countDocuments({ creatorId }),
        Episode.aggregate([
          { $match: { creatorId } },
          { $group: { _id: null, total: { $sum: '$plays' } } }
        ]),
        Episode.aggregate([
          { $match: { creatorId } },
          { $group: { _id: null, total: { $sum: '$likes' } } }
        ]),
        Episode.countDocuments({ creatorId, approvalStatus: 'pending' })
      ]);

    res.json({
      success: true,
      data: {
        totalPodcasts,
        totalEpisodes,
        totalPlays: totalPlays[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        pendingEpisodes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== PODCAST MANAGEMENT ==========

// GET /api/creator/podcasts
// In CreatorController.js - REPLACE getMyPodcasts function

exports.getMyPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ creatorId: req.user._id })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Calculate episode count for each podcast
    const podcastsWithCounts = await Promise.all(
      podcasts.map(async (podcast) => {
        const episodeCount = await Episode.countDocuments({ 
          podcastId: podcast._id,
          isActive: true 
        });
        
        const totalPlays = await Episode.aggregate([
          { $match: { podcastId: podcast._id } },
          { $group: { _id: null, total: { $sum: '$plays' } } }
        ]);

        return {
          ...podcast,
          episodeCount,
          totalPlays: totalPlays[0]?.total || 0
        };
      })
    );

    res.json({ success: true, podcasts: podcastsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// GET /api/creator/podcasts/:id
exports.getPodcastById = async (req, res) => {
  try {
    const podcast = await Podcast.findOne({
      _id: req.params.id,
      creatorId: req.user._id
    }).populate('categoryId');

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    res.json({ success: true, podcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/creator/podcasts - ✅ WITH FILE UPLOAD
exports.createPodcast = async (req, res) => {
  try {
    const data = req.body;
    
    // ✅ Handle cover image upload
    if (req.file) {
      data.coverImage = `/uploads/images/${req.file.filename}`;
    }
    
    // Generate slug from title
    const slug = data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const podcast = await Podcast.create({
      ...data,
      creatorId: req.user._id,
      slug,
      status: 'draft',
      approvalStatus: 'pending'
    });

    res.status(201).json({ success: true, message: 'Podcast created', podcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/creator/podcasts/:id - ✅ WITH FILE UPLOAD
exports.updatePodcast = async (req, res) => {
  try {
    const data = req.body;
    
    // ✅ Handle cover image upload
    if (req.file) {
      data.coverImage = `/uploads/images/${req.file.filename}`;
    }
    
    const podcast = await Podcast.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user._id },
      data,
      { new: true }
    );

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    res.json({ success: true, message: 'Podcast updated', podcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/creator/podcasts/:id
exports.deletePodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findOneAndDelete({
      _id: req.params.id,
      creatorId: req.user._id
    });

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    // Delete all episodes of this podcast
    await Episode.deleteMany({ podcastId: podcast._id });

    res.json({ success: true, message: 'Podcast deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/creator/podcasts/:id/publish
exports.publishPodcast = async (req, res) => {
  try {
    const podcast = await Podcast.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user._id },
      {
        status: 'pending',
        approvalStatus: 'pending',
        isPublished: false
      },
      { new: true }
    );

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    res.json({ success: true, message: 'Podcast submitted for approval', podcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== EPISODE MANAGEMENT ==========

// GET /api/creator/episodes
exports.getMyEpisodes = async (req, res) => {
  try {
    const { podcastId, status } = req.query;
    const filter = { creatorId: req.user._id };

    if (podcastId) filter.podcastId = podcastId;
    if (status) filter.status = status;

    const episodes = await Episode.find(filter)
      .populate('podcastId', 'title coverImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, episodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/creator/episodes/:id
exports.getEpisodeById = async (req, res) => {
  try {
    const episode = await Episode.findOne({
      _id: req.params.id,
      creatorId: req.user._id
    }).populate('podcastId');

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    res.json({ success: true, episode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/creator/episodes - ✅ WITH FILE UPLOAD
exports.createEpisode = async (req, res) => {
  try {
    const data = req.body;
    
    // ✅ Handle uploaded files
    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        data.audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
        data.audioFileSize = req.files.audio[0].size;
        data.audioFormat = path.extname(req.files.audio[0].filename).slice(1);
      }
      if (req.files.video && req.files.video[0]) {
        data.videoUrl = `/uploads/video/${req.files.video[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        data.thumbnail = `/uploads/images/${req.files.thumbnail[0].filename}`;
      }
    }
    
    // Verify podcast belongs to creator
    const podcast = await Podcast.findOne({ _id: data.podcastId, creatorId: req.user._id });
    if (!podcast) {
      return res.status(403).json({ success: false, message: 'Podcast not found or unauthorized' });
    }

    // Convert tags if string
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // Generate slug
    const slug = data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Format duration
    const duration = parseInt(data.duration) || 0;
    const formattedDuration = duration ? 
      `${Math.floor(duration / 3600)}:${String(Math.floor((duration % 3600) / 60)).padStart(2, '0')}:${String(duration % 60).padStart(2, '0')}` : '';

    const episode = await Episode.create({
      ...data,
      creatorId: req.user._id,
      slug,
      duration,
      formattedDuration,
      hasTranscript: !!data.transcript,
      status: 'draft',
      approvalStatus: 'pending',
      processingStatus: 'completed'
    });

    res.status(201).json({ success: true, message: 'Episode created', episode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/creator/episodes/:id - ✅ WITH FILE UPLOAD
exports.updateEpisode = async (req, res) => {
  try {
    const data = req.body;
    
    // ✅ Handle uploaded files
    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        data.audioUrl = `/uploads/audio/${req.files.audio[0].filename}`;
        data.audioFileSize = req.files.audio[0].size;
        data.audioFormat = path.extname(req.files.audio[0].filename).slice(1);
      }
      if (req.files.video && req.files.video[0]) {
        data.videoUrl = `/uploads/video/${req.files.video[0].filename}`;
      }
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        data.thumbnail = `/uploads/images/${req.files.thumbnail[0].filename}`;
      }
    }
    
    // Convert tags if string
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    
    const episode = await Episode.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user._id },
      data,
      { new: true }
    );

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    res.json({ success: true, message: 'Episode updated', episode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/creator/episodes/:id
exports.deleteEpisode = async (req, res) => {
  try {
    const episode = await Episode.findOneAndDelete({
      _id: req.params.id,
      creatorId: req.user._id
    });

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    // Update podcast episode count
    await Podcast.findByIdAndUpdate(episode.podcastId, {
      $inc: { episodeCount: -1 }
    });

    res.json({ success: true, message: 'Episode deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/creator/episodes/:id/publish
exports.publishEpisode = async (req, res) => {
  try {
    const episode = await Episode.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user._id },
      {
        status: 'pending',
        approvalStatus: 'pending',
        isPublished: false
      },
      { new: true }
    );

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    res.json({ success: true, message: 'Episode submitted for approval', episode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== ANALYTICS ==========

// GET /api/creator/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const creatorId = req.user._id;

    const episodes = await Episode.find({ creatorId })
      .select('title plays likes comments downloads rating')
      .sort({ plays: -1 });

    const topEpisodes = episodes.slice(0, 10);

    res.json({ success: true, topEpisodes, totalEpisodes: episodes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== PROFILE ==========

// GET /api/creator/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/creator/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
