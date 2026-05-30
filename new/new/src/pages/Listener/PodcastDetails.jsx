import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  Share2, 
  Clock, 
  Calendar,
  Video,
  User,
  Podcast as PodcastIcon,
  ChevronLeft,
  MoreHorizontal
} from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const PodcastDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    fetchPodcastDetail, 
    subscribeToPodcast, 
    unsubscribeFromPodcast, 
    fetchSubscriptions,
    isAuthenticated 
  } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetchPodcastDetail(id);
        setData(res);
        
        if (isAuthenticated) {
          try {
            const subs = await fetchSubscriptions();
            const isSubscribed = subs.some(sub => sub.podcastId?._id === id);
            setSubscribed(isSubscribed);
          } catch (subError) {
            console.log('Could not fetch subscriptions:', subError);
          }
        }
      } catch (error) {
        console.error('Failed to load podcast:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) load();
  }, [id, isAuthenticated]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      alert('Please login to subscribe');
      return;
    }

    setSubscribing(true);
    try {
      if (subscribed) {
        await unsubscribeFromPodcast(id);
        setSubscribed(false);
        setData(prev => ({
          ...prev,
          podcast: {
            ...prev.podcast,
            subscriberCount: (prev.podcast.subscriberCount || 0) - 1
          }
        }));
      } else {
        await subscribeToPodcast(id);
        setSubscribed(true);
        setData(prev => ({
          ...prev,
          podcast: {
            ...prev.podcast,
            subscriberCount: (prev.podcast.subscriberCount || 0) + 1
          }
        }));
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data?.podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PodcastIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Podcast Not Found</h2>
          <p className="text-gray-500 mb-6">This podcast may not be available.</p>
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

  const { podcast, episodes = [] } = data;

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
            
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cover Image */}
          <div className="flex-shrink-0">
            <div className="w-72 h-72 rounded-2xl overflow-hidden shadow-xl">
              {podcast.coverImage ? (
                <img
                  src={getFullUrl(podcast.coverImage)}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-100 flex items-center justify-center text-6xl">🎙️</div>';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-6xl">🎙️</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            {/* Category */}
            {podcast.categoryId?.name && (
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                {podcast.categoryId.name}
              </span>
            )}

            {/* Title */}
            <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {podcast.title}
            </h1>

            {/* Creator */}
            {podcast.creatorId && (
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{podcast.creatorId.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">Creator</p>
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-base text-gray-600 mb-8 leading-relaxed max-w-2xl">
              {podcast.description}
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-8 mb-8">
              <div>
                <p className="text-2xl font-semibold text-gray-900">{episodes.length}</p>
                <p className="text-sm text-gray-500">Episodes</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{podcast.subscriberCount?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-500">Subscribers</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{podcast.totalPlays?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-500">Plays</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className={`px-8 py-3 rounded-full font-semibold text-sm transition-all ${
                  subscribed
                    ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {subscribing ? 'Loading...' : subscribed ? 'Subscribed' : 'Subscribe'}
              </button>

              <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>

              <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition">
                <Heart className={`w-5 h-5 ${subscribed ? 'fill-gray-900 text-gray-900' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Episodes ({episodes.length})
        </h2>

        {episodes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <PodcastIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No episodes published yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {episodes.map((ep, index) => (
              <Link
                key={ep._id}
                to={`/listener/episodes/${ep._id}`}
                className="group flex items-center gap-4 bg-white p-4 rounded-xl hover:bg-gray-50 transition-all border border-gray-200"
              >
                {/* Number */}
                <div className="w-8 text-center">
                  <span className="text-sm font-medium text-gray-400 group-hover:text-gray-900 transition">
                    {ep.episodeNumber || index + 1}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {ep.thumbnail ? (
                    <img
                      src={getFullUrl(ep.thumbnail)}
                      alt={ep.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎧</div>
                  )}
                  {ep.videoUrl && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                      <Video className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{ep.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1 mb-2">{ep.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    {ep.formattedDuration && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{ep.formattedDuration}</span>
                      </span>
                    )}
                    <span>{ep.plays || 0} plays</span>
                    {ep.publishedAt && (
                      <span>{new Date(ep.publishedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>

                {/* Play Button */}
                <button className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastDetail;
