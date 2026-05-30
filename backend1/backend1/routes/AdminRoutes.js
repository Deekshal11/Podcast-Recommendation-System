// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

const { protect, roleCheck } = require('../middleware/auth');
const adminController = require('../controllers/AdminController');

// All admin routes require: logged in + ADMIN role
router.use(protect, roleCheck(['admin', 'ADMIN']));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.patch('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Podcasts
router.get('/podcasts', adminController.getAllPodcasts);
router.patch('/podcasts/:id/approve', adminController.approvePodcast);
router.patch('/podcasts/:id/reject', adminController.rejectPodcast);
router.patch('/podcasts/:id/feature', adminController.togglePodcastFeatured);

// Episodes
router.get('/episodes/pending', adminController.getPendingEpisodes);
router.patch('/episodes/:id/approve', adminController.approveEpisode);
router.patch('/episodes/:id/reject', adminController.rejectEpisode);

// Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.patch('/categories/:id/toggle', adminController.toggleCategoryActive);
router.delete('/categories/:id', adminController.deleteCategory);

module.exports = router;
