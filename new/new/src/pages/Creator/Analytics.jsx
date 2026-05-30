import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { 
  TrendingUp, 
  Headphones, 
  Heart, 
  MessageCircle,
  Target,
  BarChart3,
  Zap,
  Activity
} from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const CreatorAnalytics = () => {
  const { fetchCreatorAnalytics } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCreatorAnalytics();
        console.log('Analytics data:', res);
        setData(res);
      } catch (error) {
        console.error('Analytics error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchCreatorAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate metrics
  const totalPlays = data?.topEpisodes?.reduce((sum, ep) => sum + (ep.plays || 0), 0) || 0;
  const totalLikes = data?.topEpisodes?.reduce((sum, ep) => sum + (ep.likes || 0), 0) || 0;
  const totalComments = data?.topEpisodes?.reduce((sum, ep) => sum + (ep.comments || 0), 0) || 0;
  const avgRating = data?.topEpisodes?.reduce((sum, ep) => sum + (ep.rating || 0), 0) / (data?.topEpisodes?.length || 1);
  const engagementRate = totalPlays > 0 ? ((totalLikes + totalComments) / totalPlays * 100).toFixed(1) : 0;

  // Prepare chart data
  const topEps = data?.topEpisodes?.slice(0, 5) || [];
  const maxPlays = Math.max(...topEps.map(ep => ep.plays || 0), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-500">Track your podcast performance and growth</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Headphones className="w-10 h-10 opacity-80" />
              <TrendingUp className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalPlays.toLocaleString()}</h3>
            <p className="text-blue-100 text-sm font-medium">Total Plays</p>
            <p className="text-xs text-blue-100 mt-3 pt-3 border-t border-blue-400/30">
              {data?.topEpisodes?.length || 0} episodes
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-10 h-10 opacity-80" />
              <Activity className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalLikes.toLocaleString()}</h3>
            <p className="text-pink-100 text-sm font-medium">Total Likes</p>
            <p className="text-xs text-pink-100 mt-3 pt-3 border-t border-pink-400/30">
              {engagementRate}% engagement
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <MessageCircle className="w-10 h-10 opacity-80" />
              <BarChart3 className="w-6 h-6 opacity-60" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalComments.toLocaleString()}</h3>
            <p className="text-purple-100 text-sm font-medium">Total Comments</p>
            <p className="text-xs text-purple-100 mt-3 pt-3 border-t border-purple-400/30">
              ⭐ {avgRating.toFixed(1)} avg rating
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Episodes Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top 5 Episodes</h3>
                <p className="text-xs text-gray-500">By plays</p>
              </div>
            </div>

            {topEps.length > 0 ? (
              <div className="space-y-4">
                {topEps.map((ep, index) => (
                  <div key={ep._id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-sm font-bold text-gray-400 w-5">{index + 1}</span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {ep.title}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 ml-2">
                        {ep.plays?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${(ep.plays / maxPlays) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">No data yet</p>
              </div>
            )}
          </div>

          {/* Engagement Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Engagement Metrics</h3>
                <p className="text-xs text-gray-500">Average per episode</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-blue-500" />
                    Plays
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.round(totalPlays / (data?.topEpisodes?.length || 1))}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Likes
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.round(totalLikes / (data?.topEpisodes?.length || 1))}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-purple-500" />
                    Comments
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {Math.round(totalComments / (data?.topEpisodes?.length || 1))}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Engagement Rate</span>
                  <span className={`text-lg font-bold ${
                    engagementRate > 5 ? 'text-green-600' :
                    engagementRate > 2 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {engagementRate}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      engagementRate > 5 ? 'bg-green-500' :
                      engagementRate > 2 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(engagementRate * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Episodes List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Top Performing Episodes</h2>
                <p className="text-sm text-gray-500">Ranked by total engagement</p>
              </div>
            </div>
          </div>

          {data?.topEpisodes?.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {data.topEpisodes.slice(0, 10).map((ep, index) => (
                <div key={ep._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Thumbnail */}
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {ep.thumbnail ? (
                        <img
                          src={getFullUrl(ep.thumbnail)}
                          alt={ep.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl">🎧</div>';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🎧</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate mb-2">{ep.title}</h3>
                      <div className="flex items-center flex-wrap gap-3 text-xs">
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                          <Headphones className="w-3 h-3" />
                          {ep.plays?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1 bg-pink-50 text-pink-700 px-2 py-1 rounded-full font-medium">
                          <Heart className="w-3 h-3" />
                          {ep.likes?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">
                          <MessageCircle className="w-3 h-3" />
                          {ep.comments?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>

                    {/* Rating */}
                    {ep.rating > 0 && (
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-2 rounded-lg">
                          <span className="text-lg">⭐</span>
                          <span className="text-lg font-bold text-gray-900">{ep.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-3 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Yet</h3>
              <p className="text-sm">Publish episodes to see performance data</p>
            </div>
          )}
        </div>

        {/* Growth Tips */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Growth Strategies</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Consistent Publishing</p>
                    <p className="text-xs text-gray-600">Weekly releases build loyalty</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Engage with Comments</p>
                    <p className="text-xs text-gray-600">Build community connections</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Share on Social Media</p>
                    <p className="text-xs text-gray-600">Expand your reach</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Optimize Titles</p>
                    <p className="text-xs text-gray-600">Use searchable keywords</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorAnalytics;
