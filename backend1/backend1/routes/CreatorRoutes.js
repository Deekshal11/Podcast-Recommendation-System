const express = require('express');
const router = express.Router();
const { protect, roleCheck } = require('../middleware/auth');
const creatorController = require('../controllers/CreatorController');
const upload = require('../middleware/upload');

// All creator routes require: logged in + CREATOR role
router.use(protect, roleCheck(['creator', 'CREATOR']));

// Dashboard
router.get('/dashboard', creatorController.getCreatorDashboard);

// Profile
router.get('/profile', creatorController.getProfile);
router.patch('/profile', creatorController.updateProfile);

// Podcasts
router.get('/podcasts', creatorController.getMyPodcasts);
router.get('/podcasts/:id', creatorController.getPodcastById);
router.post('/podcasts', upload.single('coverImage'), creatorController.createPodcast); // ✅ ADDED
router.patch('/podcasts/:id', upload.single('coverImage'), creatorController.updatePodcast); // ✅ ADDED
router.delete('/podcasts/:id', creatorController.deletePodcast);
router.patch('/podcasts/:id/publish', creatorController.publishPodcast);

// Episodes
router.get('/episodes', creatorController.getMyEpisodes);
router.get('/episodes/:id', creatorController.getEpisodeById);
router.post('/episodes', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), creatorController.createEpisode); // ✅ ADDED
router.patch('/episodes/:id', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), creatorController.updateEpisode); // ✅ ADDED
router.delete('/episodes/:id', creatorController.deleteEpisode);
router.patch('/episodes/:id/publish', creatorController.publishEpisode);

// Analytics
router.get('/analytics', creatorController.getAnalytics);

module.exports = router;
