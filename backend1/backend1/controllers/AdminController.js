// controllers/AdminController.js
const User = require('../models/User');
const Podcast = require('../models/Podcast');
const Episode = require('../models/Episode');
const Category = require('../models/Category');

// ========== DASHBOARD ==========

// GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalCreators, totalAdmins, totalPodcasts, totalEpisodes, pendingEpisodes] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'CREATOR' }),
        User.countDocuments({ role: 'ADMIN' }),
        Podcast.countDocuments(),
        Episode.countDocuments(),
        Episode.countDocuments({ approvalStatus: 'pending' })
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCreators,
        totalAdmins,
        totalPodcasts,
        totalEpisodes,
        pendingEpisodes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== USER MANAGEMENT ==========

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role.toUpperCase();
    if (status) filter.status = status.toUpperCase();
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/block
exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { status: 'BLOCKED' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User blocked successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/unblock
exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { status: 'ACTIVE' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User unblocked successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // LISTENER / CREATOR / ADMIN

    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: role.toUpperCase() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== PODCAST MANAGEMENT ==========

// GET /api/admin/podcasts
exports.getAllPodcasts = async (req, res) => {
  try {
    const { status, approvalStatus, creatorId, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (creatorId) filter.creatorId = creatorId;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const podcasts = await Podcast.find(filter)
      .populate('creatorId', 'name email')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, podcasts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/podcasts/:id/approve
exports.approvePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'approved',
        status: 'approved',
        isPublished: true,
        publishedAt: new Date(),
        approvedBy: req.user._id,
        approvedAt: new Date(),
        rejectionReason: null
      },
      { new: true }
    );

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    res.json({ success: true, message: 'Podcast approved', podcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/podcasts/:id/reject
exports.rejectPodcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const podcast = await Podcast.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'rejected',
        status: 'rejected',
        isPublished: false,
        rejectionReason: reason || 'Rejected by admin',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!podcast) {
      return res.status(404).json({ success: false, message: 'Podcast not found' });
    }

    res.json({ success: true, message: 'Podcast rejected', podcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/podcasts/:id/feature
exports.togglePodcastFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured, isTrending } = req.body;

    const podcast = await Podcast.findByIdAndUpdate(
      id,
      {
        ...(typeof isFeatured === 'boolean' && { isFeatured }),
        ...(typeof isTrending === 'boolean' && { isTrending })
      },
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

// ========== EPISODE APPROVALS ==========

// GET /api/admin/episodes/pending
exports.getPendingEpisodes = async (req, res) => {
  try {
    const episodes = await Episode.find({ approvalStatus: 'pending' })
      .populate('podcastId', 'title')
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, episodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/episodes/:id/approve
exports.approveEpisode = async (req, res) => {
  try {
    const { id } = req.params;

    const episode = await Episode.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'approved',
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
        approvedBy: req.user._id,
        approvedAt: new Date(),
        rejectionReason: null
      },
      { new: true }
    );

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    // increment podcast episodeCount and totalDuration
    await Podcast.findByIdAndUpdate(episode.podcastId, {
      $inc: {
        episodeCount: 1,
        totalDuration: episode.duration ? Math.round(episode.duration / 60) : 0
      }
    });

    res.json({ success: true, message: 'Episode approved', episode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/episodes/:id/reject
exports.rejectEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const episode = await Episode.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'rejected',
        status: 'rejected',
        isPublished: false,
        rejectionReason: reason || 'Rejected by admin',
        approvedBy: req.user._id,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    res.json({ success: true, message: 'Episode rejected', episode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========== CATEGORY MANAGEMENT ==========

// GET /api/admin/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, parentId, color, icon, image, displayOrder, isFeatured } = req.body;

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    let level = 0;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (parent) level = (parent.level || 0) + 1;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parentId: parentId || null,
      level,
      color,
      icon,
      image,
      displayOrder: displayOrder || 0,
      isFeatured: !!isFeatured
    });

    res.status(201).json({ success: true, message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.parentId) {
      const parent = await Category.findById(updateData.parentId);
      updateData.level = parent ? (parent.level || 0) + 1 : 0;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category updated', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/categories/:id/toggle
exports.toggleCategoryActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: !!isActive },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category status updated', category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const usedByPodcast = await Podcast.findOne({ categoryId: id });
    if (usedByPodcast) {
      return res.status(400).json({
        success: false,
        message: 'Category is used by podcasts. Reassign or remove them first.'
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
