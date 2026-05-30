import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Send, Eye, Music, Headphones, Users } from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const MyPodcasts = () => {
  const { fetchCreatorPodcasts, deletePodcast, publishPodcast } = useAuth();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadPodcasts = async () => {
    setLoading(true);
    try {
      const data = await fetchCreatorPodcasts();
      console.log('Podcasts loaded:', data);
      setPodcasts(data || []);
    } catch (error) {
      console.error('Load error:', error);
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPodcasts();
  }, []);

  const handleDelete = async (podcast) => {
    if (!window.confirm(`Delete "${podcast.title}"? This will delete all episodes too.`)) return;
    setActionLoading(podcast._id + '-delete');
    try {
      await deletePodcast(podcast._id);
      setPodcasts(prev => prev.filter(p => p._id !== podcast._id));
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (podcast) => {
    setActionLoading(podcast._id + '-publish');
    try {
      const updated = await publishPodcast(podcast._id);
      setPodcasts(prev => prev.map(p => (p._id === podcast._id ? updated : p)));
    } catch (error) {
      console.error('Publish error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (podcast) => {
    // Check actual approval status
    if (podcast.isPublished && podcast.approvalStatus === 'approved') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ Live</span>;
    }
    if (podcast.approvalStatus === 'pending') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">⏳ Pending</span>;
    }
    if (podcast.approvalStatus === 'rejected') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">✗ Rejected</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">📝 Draft</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Podcasts</h1>
            <p className="text-gray-500">Manage your podcast series and episodes</p>
          </div>
          <Link
            to="/creator/podcasts/new"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Podcast</span>
          </Link>
        </div>

        {/* Podcasts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : podcasts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No podcasts yet</h3>
            <p className="text-gray-500 mb-6">Create your first podcast to get started</p>
            <Link
              to="/creator/podcasts/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Podcast</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {podcasts.map(podcast => (
              <div
                key={podcast._id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {podcast.coverImage ? (
                    <img
                      src={getFullUrl(podcast.coverImage)}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"><div class="text-6xl">🎙️</div></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Music className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {/* <div className="absolute top-3 right-3">
                    {getStatusBadge(podcast)}
                  </div> */}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug min-h-[3.5rem]">
                    {podcast.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {podcast.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                    <span className="flex items-center gap-1">
                      <Headphones className="w-3.5 h-3.5" />
                      <span>{podcast.episodeCount || 0} eps</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{podcast.subscriberCount || 0}</span>
                    </span>
                    <span>{podcast.totalPlays || 0} plays</span>
                  </div>

                  {/* Category */}
                  {podcast.categoryId?.name && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {podcast.categoryId.name}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/creator/podcasts/${podcast._id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full hover:bg-gray-200 transition"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>

                    {/* {(!podcast.isPublished || podcast.approvalStatus === 'draft') && (
                      <button
                        onClick={() => handlePublish(podcast)}
                        disabled={actionLoading === podcast._id + '-publish'}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-700 text-sm font-semibold rounded-full hover:bg-green-100 transition disabled:opacity-50"
                        title="Submit for approval"
                      >
                      </button>
                    )} */}

                    <Link
                      to={`/creator/episodes?podcastId=${podcast._id}`}
                      className="flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition"
                      title="View episodes"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(podcast)}
                      disabled={actionLoading === podcast._id + '-delete'}
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition disabled:opacity-50"
                      title="Delete podcast"
                    >
                      {actionLoading === podcast._id + '-delete' ? (
                        <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPodcasts;
