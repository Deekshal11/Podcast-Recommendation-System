const Podcast = require('../models/Podcast');
const Episode = require('../models/Episode');
const Category = require('../models/Category');
const User = require('../models/User');
const mongoose = require('mongoose');

// Define schemas for listener-specific collections
const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode', required: true },
  lastPosition: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  lastPlayedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const playlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  episodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }],
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  podcastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Podcast', required: true }
}, { timestamps: true });

const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode', required: true }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode', required: true },
  text: { type: String, required: true }
}, { timestamps: true });

// ✅ ADD THIS NEW SCHEMA after commentSchema
const playSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  episodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Episode', required: true },
  podcastId: { type: mongoose.Schema.Types.ObjectId, ref: 'Podcast', required: true }
}, { timestamps: true });

playSchema.index({ userId: 1, episodeId: 1 }, { unique: true });

const Play = mongoose.model('Play', playSchema);

const History = mongoose.model('History', historySchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);
const Like = mongoose.model('Like', likeSchema);
const Comment = mongoose.model('Comment', commentSchema);

// ========== BROWSE & DISCOVER ==========

// GET /api/listener/home
exports.getHome = async (req, res) => {
  try {
    const [trending, featured, newReleases, categories] = await Promise.all([
      Podcast.find({ isTrending: true, isPublished: true, isActive: true })
        .populate('categoryId', 'name')
        .limit(10),
      Podcast.find({ isFeatured: true, isPublished: true, isActive: true })
        .populate('categoryId', 'name')
        .limit(10),
      Episode.find({ isPublished: true, isActive: true })
        .populate('podcastId', 'title coverImage')
        .sort({ publishedAt: -1 })
        .limit(12),
      Category.find({ isActive: true }).limit(8)
    ]);

    res.json({ success: true, trending, featured, newReleases, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/listener/podcasts
exports.getAllPodcasts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {isActive: true };

    if (category) filter.categoryId = category;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    const podcasts = await Podcast.find(filter)
      .populate('categoryId', 'name')
      .populate('creatorId', 'name avatar')
      .sort({ totalPlays: -1 });

    res.json({ success: true, podcasts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/listener/podcasts/:id
exports.getPodcastDetail = async (req, res) => {
  try {
    const podcast = await Podcast.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate('categoryId')
      .populate('creatorId', 'name avatar');

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    const episodes = await Episode.find({
      podcastId: podcast._id,
      isPublished: true,
      isActive: true
    }).sort({ episodeNumber: -1 });

    res.json({ success: true, podcast, episodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/listener/episodes/:id
// REPLACE this function
exports.getEpisodeDetail = async (req, res) => {
  try {
    const episode = await Episode.findOne({
      _id: req.params.id,
      isPublished: true,
      isActive: true
    })
      .populate('podcastId', 'title coverImage creatorId')
      .populate('creatorId', 'name avatar');

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    // ✅ Only count unique plays per user
    if (req.user) {
      try {
        await Play.create({
          userId: req.user._id,
          episodeId: episode._id,
          podcastId: episode.podcastId._id
        });

        // Increment counts only on first play
        await Promise.all([
          Episode.findByIdAndUpdate(episode._id, { $inc: { plays: 1 } }),
          Podcast.findByIdAndUpdate(episode.podcastId._id, { $inc: { totalPlays: 1 } })
        ]);
      } catch (error) {
        // User already played this episode (duplicate error)
        if (error.code !== 11000) console.error('Play error:', error);
      }
    }

    res.json({ success: true, episode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/listener/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== SUBSCRIPTIONS ==========

// POST /api/listener/subscriptions
exports.subscribe = async (req, res) => {
  try {
    const { podcastId } = req.body;

    const existing = await Subscription.findOne({
      userId: req.user._id,
      podcastId
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already subscribed' });
    }

    await Subscription.create({ userId: req.user._id, podcastId });

    await Podcast.findByIdAndUpdate(podcastId, { $inc: { subscriberCount: 1 } });

    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/listener/subscriptions/:podcastId
exports.unsubscribe = async (req, res) => {
  try {
    const { podcastId } = req.params;

    const sub = await Subscription.findOneAndDelete({
      userId: req.user._id,
      podcastId
    });

    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    await Podcast.findByIdAndUpdate(podcastId, { $inc: { subscriberCount: -1 } });

    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/listener/subscriptions
exports.getSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ userId: req.user._id })
      .populate('podcastId')
      .sort({ createdAt: -1 });

    res.json({ success: true, subscriptions: subs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== LIKES ==========

// POST /api/listener/likes
exports.likeEpisode = async (req, res) => {
  try {
    const { episodeId } = req.body;

    const existing = await Like.findOne({ userId: req.user._id, episodeId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already liked' });
    }

    await Like.create({ userId: req.user._id, episodeId });
    await Episode.findByIdAndUpdate(episodeId, { $inc: { likes: 1 } });

    res.json({ success: true, message: 'Liked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/listener/likes/:episodeId
exports.unlikeEpisode = async (req, res) => {
  try {
    const { episodeId } = req.params;

    const like = await Like.findOneAndDelete({ userId: req.user._id, episodeId });
    if (!like) {
      return res.status(404).json({ success: false, message: 'Like not found' });
    }

    await Episode.findByIdAndUpdate(episodeId, { $inc: { likes: -1 } });

    res.json({ success: true, message: 'Unliked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== COMMENTS ==========

// POST /api/listener/comments
exports.addComment = async (req, res) => {
  try {
    const { episodeId, text } = req.body;

    const comment = await Comment.create({ userId: req.user._id, episodeId, text });
    await Episode.findByIdAndUpdate(episodeId, { $inc: { comments: 1 } });

    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/listener/episodes/:id/comments
exports.getEpisodeComments = async (req, res) => {
  try {
    const comments = await Comment.find({ episodeId: req.params.id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== PLAYLISTS ==========

// GET /api/listener/playlists
exports.getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id })
      .populate('episodes')
      .sort({ createdAt: -1 });

    res.json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/listener/playlists
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const playlist = await Playlist.create({
      userId: req.user._id,
      name,
      description,
      isPublic
    });

    res.status(201).json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/listener/playlists/:id/add
exports.addToPlaylist = async (req, res) => {
  try {
    const { episodeId } = req.body;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $addToSet: { episodes: episodeId } },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/listener/playlists/:id/remove
exports.removeFromPlaylist = async (req, res) => {
  try {
    const { episodeId } = req.body;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $pull: { episodes: episodeId } },
      { new: true }
    );

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    res.json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/listener/playlists/:id
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    res.json({ success: true, message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== HISTORY ==========

// POST /api/listener/history
exports.updateHistory = async (req, res) => {
  try {
    const { episodeId, lastPosition, completed } = req.body;

    const history = await History.findOneAndUpdate(
      { userId: req.user._id, episodeId },
      { lastPosition, completed, lastPlayedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/listener/history
// REPLACE getHistory function
exports.getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id })
      .populate({
        path: 'episodeId',
        populate: { path: 'podcastId', select: 'title coverImage' }
      })
      .sort({ lastPlayedAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, history }); // ✅ Correct structure
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
