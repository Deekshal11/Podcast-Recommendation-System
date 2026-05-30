const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const listenerController = require('../controllers/ListenerController');

// Public routes (no auth needed)
router.get('/home', listenerController.getHome);
router.get('/podcasts', listenerController.getAllPodcasts);
router.get('/podcasts/:id', listenerController.getPodcastDetail);
router.get('/episodes/:id', listenerController.getEpisodeDetail);
router.get('/categories', listenerController.getCategories);

// Protected routes (require login)
router.use(protect);

// Subscriptions
router.post('/subscriptions', listenerController.subscribe);
router.delete('/subscriptions/:podcastId', listenerController.unsubscribe);
router.get('/subscriptions', listenerController.getSubscriptions);

// Likes
router.post('/likes', listenerController.likeEpisode);
router.delete('/likes/:episodeId', listenerController.unlikeEpisode);

// Comments
router.post('/comments', listenerController.addComment);
router.get('/episodes/:id/comments', listenerController.getEpisodeComments);

// Playlists
router.get('/playlists', listenerController.getPlaylists);
router.post('/playlists', listenerController.createPlaylist);
router.patch('/playlists/:id/add', listenerController.addToPlaylist);
router.patch('/playlists/:id/remove', listenerController.removeFromPlaylist);
router.delete('/playlists/:id', listenerController.deletePlaylist);

// History
router.post('/history', listenerController.updateHistory);
router.get('/history', listenerController.getHistory);

module.exports = router;
