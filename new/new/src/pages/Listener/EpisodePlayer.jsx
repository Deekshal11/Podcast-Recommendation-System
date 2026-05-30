import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/Context';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Clock,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Plus,
  List as ListIcon,
  Music
} from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const EpisodePlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchEpisodeDetail,
    likeEpisode,
    unlikeEpisode,
    addComment,
    fetchEpisodeComments,
    updateHistory,
    fetchPlaylists,
    addToPlaylist,
    createPlaylist
  } = useAuth();

  const [episode, setEpisode] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  
  // Playlist Modal States
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);

  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [ep, cmts] = await Promise.all([
          fetchEpisodeDetail(id),
          fetchEpisodeComments(id)
        ]);
        console.log('Episode loaded:', ep);
        setEpisode(ep);
        setComments(cmts || []);
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Update playback time
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && episode) {
        updateHistory(id, currentTime, false).catch(() => {});
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, id, episode]);

  const mediaRef = episode?.videoUrl ? videoRef : audioRef;

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      setDuration(mediaRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime += seconds;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikeEpisode(id);
        setLiked(false);
        setEpisode(prev => ({ ...prev, likes: (prev.likes || 0) - 1 }));
      } else {
        await likeEpisode(id);
        setLiked(true);
        setEpisode(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const newComment = await addComment(id, commentText);
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      setEpisode(prev => ({ ...prev, comments: (prev.comments || 0) + 1 }));
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: episode?.title,
        text: episode?.description,
        url: url
      }).catch(err => console.log('Share failed:', err));
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // Playlist Functions
  const handleOpenPlaylistModal = async () => {
    setShowPlaylistModal(true);
    setLoadingPlaylists(true);
    try {
      const data = await fetchPlaylists();
      setPlaylists(data || []);
    } catch (error) {
      console.error('Load playlists error:', error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addToPlaylist(playlistId, id);
      setShowPlaylistModal(false);
    } catch (error) {
      console.error('Add to playlist error:', error);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    
    setCreatingPlaylist(true);
    try {
      const newPlaylist = await createPlaylist({ 
        name: newPlaylistName.trim(), 
        description: '',
        isPublic: false 
      });
      await addToPlaylist(newPlaylist._id, id);
      setShowPlaylistModal(false);
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
    } catch (error) {
      console.error('Create playlist error:', error);
    } finally {
      setCreatingPlaylist(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Episode not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Share"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {episode.videoUrl && (
              <div className="rounded-2xl overflow-hidden bg-black shadow-xl">
                <video
                  ref={videoRef}
                  src={getFullUrl(episode.videoUrl)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                  className="w-full aspect-video"
                  controls={false}
                />
              </div>
            )}

            {/* Audio Visualization (when no video) */}
            {episode.audioUrl && !episode.videoUrl && (
              <>
                {/* Hidden Audio Element */}
                <audio
                  ref={audioRef}
                  src={getFullUrl(episode.audioUrl)}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleTimeUpdate}
                />
                
                {/* Visual Audio Player */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-xl p-8">
                  <div className="flex flex-col items-center">
                    {/* Thumbnail/Album Art */}
                    {episode.thumbnail ? (
                      <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl mb-8">
                        <img 
                          src={getFullUrl(episode.thumbnail)} 
                          alt={episode.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-64 h-64 rounded-2xl bg-gray-700 flex items-center justify-center mb-8 shadow-2xl">
                        <Music className="w-24 h-24 text-gray-500" />
                      </div>
                    )}

                    {/* Episode Info */}
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold text-white mb-2">
                        {episode.title}
                      </h1>
                      {episode.podcastId && (
                        <Link
                          to={`/listener/podcasts/${episode.podcastId._id}`}
                          className="text-sm text-gray-400 hover:text-white transition"
                        >
                          {episode.podcastId.title}
                        </Link>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full space-y-2 mb-6">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-white"
                        style={{
                          background: `linear-gradient(to right, white ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-400 font-medium">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center space-x-6 mb-6">
                      <button
                        onClick={() => skip(-15)}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-700 transition"
                        title="Back 15s"
                      >
                        <SkipBack className="w-5 h-5 text-gray-400" />
                      </button>

                      <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition shadow-2xl"
                      >
                        {isPlaying ? (
                          <Pause className="w-7 h-7 text-gray-900" />
                        ) : (
                          <Play className="w-7 h-7 text-gray-900 ml-1" />
                        )}
                      </button>

                      <button
                        onClick={() => skip(15)}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-700 transition"
                        title="Forward 15s"
                      >
                        <SkipForward className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={toggleMute} 
                        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-700 transition"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-32 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                    liked
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                  <span>{episode.likes || 0}</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition text-sm font-medium">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.length}</span>
                </button>

                {/* Add to Playlist Button */}
                <button
                  onClick={handleOpenPlaylistModal}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition text-sm font-medium"
                  title="Add to Playlist"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Playlist</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                
                {episode.allowDownloads && (
                  <a
                    href={getFullUrl(episode.audioUrl || episode.videoUrl)}
                    download
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-gray-600" />
                  </a>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About this episode</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {episode.description}
              </p>
            </div>

            {/* Show Notes */}
            {(episode.showNotes || episode.transcript) && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-3">
                    <Info className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-bold text-gray-900">Show Notes & Transcript</h3>
                  </div>
                  {showNotes ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {showNotes && (
                  <div className="p-6 pt-0 space-y-6 border-t border-gray-100">
                    {episode.showNotes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                          {episode.showNotes}
                        </p>
                      </div>
                    )}
                    {episode.transcript && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Transcript</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4">
                          {episode.transcript}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            {episode.allowComments && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Comments ({comments.length})
                </h3>

                {/* Add Comment */}
                <form onSubmit={handleComment} className="mb-6">
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition resize-none text-sm"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8 text-sm">
                      No comments yet. Be the first!
                    </p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment._id} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {comment.userId?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">
                              {comment.userId?.name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Podcast Info */}
          <div className="space-y-6">
            {episode.podcastId && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <Link to={`/listener/podcasts/${episode.podcastId._id}`}>
                  {episode.podcastId.coverImage && (
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={getFullUrl(episode.podcastId.coverImage)}
                        alt={episode.podcastId.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 mb-2 hover:text-gray-700 transition">
                    {episode.podcastId.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                    {episode.podcastId.description}
                  </p>
                </Link>

                <Link
                  to={`/listener/podcasts/${episode.podcastId._id}`}
                  className="block w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition text-center"
                >
                  View Podcast
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowPlaylistModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Add to Playlist</h3>
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingPlaylists ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Create New Playlist Toggle */}
                    <button
                      onClick={() => setShowCreatePlaylist(!showCreatePlaylist)}
                      className="w-full flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition mb-4"
                    >
                      <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Create New Playlist</p>
                        <p className="text-xs text-gray-500">Add to a new playlist</p>
                      </div>
                    </button>

                    {/* Create Playlist Form */}
                    {showCreatePlaylist && (
                      <form onSubmit={handleCreateAndAdd} className="mb-4 p-4 bg-blue-50 rounded-xl">
                        <input
                          type="text"
                          value={newPlaylistName}
                          onChange={e => setNewPlaylistName(e.target.value)}
                          placeholder="Playlist name"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition mb-3"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreatePlaylist(false);
                              setNewPlaylistName('');
                            }}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={creatingPlaylist || !newPlaylistName.trim()}
                            className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                          >
                            {creatingPlaylist ? 'Creating...' : 'Create & Add'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Existing Playlists */}
                    {playlists.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ListIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">No playlists yet</p>
                        <p className="text-xs">Create one to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {playlists.map(playlist => {
                          const alreadyAdded = playlist.episodes?.some(ep => ep._id === id);
                          return (
                            <button
                              key={playlist._id}
                              onClick={() => !alreadyAdded && handleAddToPlaylist(playlist._id)}
                              disabled={alreadyAdded}
                              className={`w-full flex items-center gap-3 p-4 rounded-xl transition ${
                                alreadyAdded
                                  ? 'bg-gray-50 cursor-not-allowed opacity-60'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ListIcon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {playlist.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {playlist.episodes?.length || 0} episodes
                                </p>
                              </div>
                              {alreadyAdded && (
                                <span className="text-xs font-medium text-green-600">
                                  ✓ Added
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EpisodePlayer;
