import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { Link } from 'react-router-dom';
import { Clock, Play, CheckCircle, Music } from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const History = () => {
  const { fetchHistory } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchHistory();
        console.log('History data:', data); // Debug log
        setHistory(data || []);
      } catch (error) {
        console.error('History load error:', error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchHistory]);

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
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Listening History</h1>
              <p className="text-gray-300 text-lg">Pick up where you left off</p>
            </div>
          </div>
        </div>

        {/* History List */}
        {!history || history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No listening history</h3>
            <p className="text-gray-500 mb-6">Episodes you listen to will appear here</p>
            <Link
              to="/listener/browse"
              className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition"
            >
              Browse Podcasts
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(item => {
              // Safe data extraction
              const episode = item?.episodeId;
              const podcast = episode?.podcastId;
              
              // Skip if episode data is missing
              if (!episode || !episode._id) {
                return null;
              }

              const progress = item.lastPosition && episode.duration 
                ? Math.min((item.lastPosition / episode.duration) * 100, 100)
                : 0;

              const formatTime = (seconds) => {
                if (!seconds) return '0:00';
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${mins}:${secs.toString().padStart(2, '0')}`;
              };

              return (
                <Link
                  key={item._id}
                  to={`/listener/episodes/${episode._id}`}
                  className="group flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {episode.thumbnail || podcast?.coverImage ? (
                      <img
                        src={getFullUrl(episode.thumbnail || podcast?.coverImage)}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-3xl">🎧</div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                        <Play className="w-5 h-5 text-gray-900 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0">
                    {/* Podcast Title */}
                    {podcast?.title && (
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        {podcast.title}
                      </p>
                    )}

                    {/* Episode Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-700 transition">
                      {episode.title}
                    </h3>

                    {/* Description */}
                    {episode.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {episode.description}
                      </p>
                    )}


                    {/* Meta Info */}
                    <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500">
                      {/* Last Played */}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(item.lastPlayedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </span>

                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
