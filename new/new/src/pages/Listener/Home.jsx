import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Star, 
  Clock, 
  Play, 
  Headphones,
  Sparkles,
  Heart,
  Users,
  Zap,
  Award,
  Radio,
  Calendar,
  ChevronRight,
  Music,
  BookOpen,
  Mic
} from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const PodcastCard = ({ podcast, badge, index }) => (
  <Link
    to={`/listener/podcasts/${podcast._id}`}
    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-500"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    <div className="relative h-48 bg-gray-100 overflow-hidden">
      {podcast.coverImage ? (
        <img
          src={getFullUrl(podcast.coverImage)}
          alt={podcast.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-5xl">🎙️</div>';
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl">🎙️</div>
      )}
      {badge && (
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-lg backdrop-blur-sm">
          {badge}
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-2xl">
          <Play className="w-5 h-5 text-gray-900 ml-0.5" />
        </div>
      </div>
    </div>
    <div className="p-5">
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-gray-700 transition">
        {podcast.title}
      </h3>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
        {podcast.description}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="flex items-center space-x-1">
          <Headphones className="w-3.5 h-3.5" />
          <span>{podcast.totalPlays?.toLocaleString() || 0}</span>
        </span>
        <span className="flex items-center space-x-1">
          <Users className="w-3.5 h-3.5" />
          <span>{podcast.subscriberCount || 0}</span>
        </span>
      </div>
    </div>
  </Link>
);

const EpisodeCard = ({ episode, index }) => (
  <Link
    to={`/listener/episodes/${episode._id}`}
    className="group flex items-start space-x-4 bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300"
    style={{ animationDelay: `${index * 30}ms` }}
  >
    <div className="relative w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
      {episode.thumbnail || episode.podcastId?.coverImage ? (
        <img
          src={getFullUrl(episode.thumbnail || episode.podcastId?.coverImage)}
          alt={episode.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-2xl">🎧</div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-300">
        <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm group-hover:text-gray-700 transition">
        {episode.title}
      </h4>
      {episode.podcastId?.title && (
        <p className="text-xs text-gray-500 mb-2">{episode.podcastId.title}</p>
      )}
      <div className="flex items-center space-x-3 text-xs text-gray-400">
        {episode.formattedDuration && (
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{episode.formattedDuration}</span>
          </span>
        )}
        <span>{episode.plays || 0} plays</span>
      </div>
    </div>
  </Link>
);

const CategoryCard = ({ category, index }) => (
  <Link
    to={`/listener/browse?category=${category._id}`}
    className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white hover:shadow-2xl transition-all duration-500 overflow-hidden"
    style={{ animationDelay: `${index * 40}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/20 group-hover:to-purple-600/20 transition-all duration-500" />
    <div className="relative">
      <div className="text-3xl mb-3">{category.icon || '📁'}</div>
      <h3 className="font-bold mb-1">{category.name}</h3>
    </div>
  </Link>
);

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg`}>
    <Icon className="w-8 h-8 mb-3 opacity-80" />
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className="text-sm opacity-90">{label}</p>
  </div>
);

const ListenerHome = () => {
  const { fetchListenerHome } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchListenerHome();
        setData(res);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchListenerHome]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  const totalPodcasts = data?.trending?.length || 0;
  const totalEpisodes = data?.newReleases?.length || 0;
  const totalCategories = data?.categories?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
          <div className="relative p-12">
            <div className="flex items-center space-x-2 mb-4">
              <Radio className="w-6 h-6 text-white" />
              <span className="text-sm font-semibold text-white/80 uppercase tracking-wide">Welcome Back</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 max-w-2xl leading-tight">
              Discover Amazing Podcasts
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Explore thousands of podcasts across all genres. Listen, learn, and be inspired by creators from around the world.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/listener/browse"
                className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition shadow-lg"
              >
                Browse All Podcasts
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            icon={Headphones} 
            label="Episodes" 
            value={totalEpisodes} 
            color="from-purple-500 to-purple-600"
          />
          <StatCard 
            icon={BookOpen} 
            label="Categories" 
            value={totalCategories} 
            color="from-green-500 to-green-600"
          />
        </div>

        {/* Trending Podcasts */}
        {data?.trending?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
                </div>
                <p className="text-gray-500 ml-13">What everyone's listening to right now</p>
              </div>
              <Link 
                to="/listener/browse?sort=trending" 
                className="flex items-center space-x-2 text-gray-900 font-semibold hover:text-gray-700 transition group"
              >
                <span>View All</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.trending.slice(0, 4).map((podcast, index) => (
                <PodcastCard key={podcast._id} podcast={podcast} badge="🔥 Trending" index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Podcasts */}
        {data?.featured?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Featured Podcasts</h2>
                </div>
                <p className="text-gray-500 ml-13">Editor's picks curated for you</p>
              </div>
              <Link 
                to="/listener/browse?sort=featured" 
                className="flex items-center space-x-2 text-gray-900 font-semibold hover:text-gray-700 transition group"
              >
                <span>View All</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.featured.slice(0, 4).map((podcast, index) => (
                <PodcastCard key={podcast._id} podcast={podcast} badge="⭐ Featured" index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Popular This Week */}
        {data?.trending?.length > 4 && (
          <section className="bg-white rounded-3xl border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Popular This Week</h2>
                </div>
                <p className="text-gray-500 ml-13">Top picks based on listener activity</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.trending.slice(4, 10).map((podcast, index) => (
                <Link
                  key={podcast._id}
                  to={`/listener/podcasts/${podcast._id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {podcast.coverImage ? (
                      <img
                        src={getFullUrl(podcast.coverImage)}
                        alt={podcast.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎙️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-gray-700 transition">
                      {podcast.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{podcast.description}</p>
                  </div>
                  <Play className="w-10 h-10 p-2 bg-gray-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* New Episodes */}
        {data?.newReleases?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Fresh Releases</h2>
                </div>
                <p className="text-gray-500 ml-13">Brand new episodes just dropped</p>
              </div>
              <Link 
                to="/listener/browse?sort=latest" 
                className="flex items-center space-x-2 text-gray-900 font-semibold hover:text-gray-700 transition group"
              >
                <span>View All</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.newReleases.slice(0, 6).map((episode, index) => (
                <EpisodeCard key={episode._id} episode={episode} index={index} />
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        {data?.categories?.length > 0 && (
          <section>
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
              </div>
              <p className="text-gray-500 ml-13">Find podcasts that match your interests</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.categories.map((category, index) => (
                <CategoryCard key={category._id} category={category} index={index} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ListenerHome;
