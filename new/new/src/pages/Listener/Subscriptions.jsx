import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { Link } from 'react-router-dom';
import { Heart, Play, Headphones, Users, Trash2, Music } from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const Subscriptions = () => {
  const { fetchSubscriptions, unsubscribeFromPodcast } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSubscriptions();
        console.log('Subscriptions data:', data);
        setSubscriptions(data || []);
      } catch (error) {
        console.error('Load error:', error);
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchSubscriptions]);

  const handleUnsubscribe = async (podcastId) => {
    if (!window.confirm('Unsubscribe from this podcast?')) return;
    setActionLoading(podcastId);
    try {
      await unsubscribeFromPodcast(podcastId);
      setSubscriptions(prev => prev.filter(sub => sub.podcastId?._id !== podcastId));
    } catch (error) {
      console.error('Unsubscribe error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                <Heart className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">My Subscriptions</h1>
                <p className="text-gray-300 text-lg">
                  {subscriptions.length} podcast{subscriptions.length !== 1 ? 's' : ''} you follow
                </p>
              </div>
            </div>

            {subscriptions.length > 0 && (
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                  <p className="text-2xl font-bold">{subscriptions.length}</p>
                  <p className="text-xs text-gray-300 uppercase tracking-wide">Following</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center">
                  <p className="text-2xl font-bold">
                    {subscriptions.reduce((acc, sub) => acc + (sub.podcastId?.episodeCount || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-300 uppercase tracking-wide">Episodes</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscriptions Grid */}
        {subscriptions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No subscriptions yet</h3>
            <p className="text-gray-500 mb-6">Subscribe to podcasts to see them here</p>
            <Link
              to="/listener/browse"
              className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition"
            >
              Browse Podcasts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subscriptions.map(sub => {
              const podcast = sub.podcastId;
              
              // Skip if podcast data is missing
              if (!podcast || !podcast._id) {
                return null;
              }

              return (
                <div
                  key={sub._id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Cover Image */}
                  <Link 
                    to={`/listener/podcasts/${podcast._id}`} 
                    className="block relative aspect-square bg-gray-100 overflow-hidden"
                  >
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
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-xl">
                        <Play className="w-6 h-6 text-gray-900 ml-0.5" />
                      </div>
                    </div>

                    {/* Subscriber Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                      <Heart className="w-3 h-3 inline mr-1 fill-current" />
                      Subscribed
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <Link to={`/listener/podcasts/${podcast._id}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-gray-700 transition min-h-[3.5rem]">
                        {podcast.title}
                      </h3>
                    </Link>
                    
                    {podcast.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {podcast.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <Headphones className="w-3.5 h-3.5" />
                        <span>{podcast.episodeCount || 0} eps</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{podcast.subscriberCount || 0}</span>
                      </span>
                      <span>{podcast.totalPlays?.toLocaleString() || 0} plays</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/listener/podcasts/${podcast._id}`}
                        className="flex-1 text-center px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleUnsubscribe(podcast._id)}
                        disabled={actionLoading === podcast._id}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Unsubscribe"
                      >
                        {actionLoading === podcast._id ? (
                          <div className="w-4 h-4 border-2 border-red-200 border-t-red-600 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
