import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/Context';
import { 
  Play, 
  Trash2, 
  ChevronLeft, 
  Clock, 
  Music,
  Edit2,
  Share2
} from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPlaylists, removeFromPlaylist, deletePlaylist } = useAuth();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPlaylists();
        const found = data?.find(p => p._id === id);
        if (!found) {
          navigate('/listener/playlists');
          return;
        }
        setPlaylist(found);
      } catch (error) {
        console.error('Load error:', error);
        navigate('/listener/playlists');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, fetchPlaylists, navigate]);

  const handleRemoveEpisode = async (episodeId) => {
    if (!window.confirm('Remove this episode from playlist?')) return;
    
    setRemoving(episodeId);
    try {
      const updated = await removeFromPlaylist(id, episodeId);
      setPlaylist(updated);
    } catch (error) {
      console.error('Remove error:', error);
    } finally {
      setRemoving(null);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm('Delete entire playlist? This cannot be undone.')) return;
    
    try {
      await deletePlaylist(id);
      navigate('/listener/playlists');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: playlist?.name, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/listener/playlists')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Playlists</span>
          </button>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Music className="w-16 h-16" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 uppercase tracking-wide mb-2">Playlist</p>
                  <h1 className="text-4xl font-bold mb-4">{playlist.name}</h1>
                  {playlist.description && (
                    <p className="text-gray-300 mb-4 leading-relaxed">{playlist.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span>{playlist.episodes?.length || 0} episodes</span>
                    {playlist.isPublic && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full font-semibold">
                          Public
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                  title="Share playlist"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDeletePlaylist}
                  className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-full transition"
                  title="Delete playlist"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {!playlist.episodes || playlist.episodes.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No episodes yet</h3>
              <p className="text-gray-500 mb-6">Start adding episodes to your playlist</p>
              <Link
                to="/listener/browse"
                className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition"
              >
                Browse Episodes
              </Link>
            </div>
          ) : (
            <div>
              {playlist.episodes.map((episode, index) => (
                <div
                  key={episode._id}
                  className="group flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                >
                  {/* Episode Number */}
                  <div className="w-8 text-center text-sm font-semibold text-gray-400 group-hover:text-gray-900">
                    {index + 1}
                  </div>

                  {/* Thumbnail */}
                  <Link
                    to={`/listener/episodes/${episode._id}`}
                    className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    {episode.thumbnail || episode.podcastId?.coverImage ? (
                      <img
                        src={getFullUrl(episode.thumbnail || episode.podcastId?.coverImage)}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-2xl">🎧</span></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition">
                      <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </Link>

                  {/* Episode Info */}
                  <Link
                    to={`/listener/episodes/${episode._id}`}
                    className="flex-1 min-w-0"
                  >
                    <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-gray-700">
                      {episode.title}
                    </h4>
                    {episode.podcastId?.title && (
                      <p className="text-xs text-gray-500">{episode.podcastId.title}</p>
                    )}
                  </Link>

                  {/* Duration */}
                  {episode.formattedDuration && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{episode.formattedDuration}</span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveEpisode(episode._id)}
                    disabled={removing === episode._id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
