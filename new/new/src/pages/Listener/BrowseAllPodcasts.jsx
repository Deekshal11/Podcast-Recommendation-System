import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Grid, 
  List, 
  Play, 
  Users,
  Clock,
  ChevronDown,
  Podcast as PodcastIcon,
  X
} from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const BrowsePodcasts = () => {
  const { fetchAllPodcasts, fetchListenerCategories } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pods, cats] = await Promise.all([
        fetchAllPodcasts(filters),
        fetchListenerCategories()
      ]);
      setPodcasts(pods || []);
      setCategories(cats || []);
    } catch (error) {
      console.error('Load error:', error);
      setPodcasts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line

  const handleSearch = () => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    setSearchParams(params);
    loadData();
  };

  const handleClearFilters = () => {
    setFilters({ search: '', category: '' });
    setSearchParams({});
    loadData();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const hasActiveFilters = filters.search || filters.category;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Podcasts</h1>
          <p className="text-gray-600">Discover your next favorite show</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                onKeyPress={handleKeyPress}
                placeholder="Search podcasts..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                value={filters.category}
                onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="appearance-none px-5 py-3 pr-12 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition min-w-[200px] bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition"
            >
              Search
            </button>
          </div>

          {/* Stats & View Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{podcasts.length}</span> podcast{podcasts.length !== 1 ? 's' : ''} found
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4 inline mr-2" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                List
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : podcasts.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No podcasts found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {podcasts.map((podcast) => (
              <Link
                key={podcast._id}
                to={`/listener/podcasts/${podcast._id}`}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {podcast.coverImage ? (
                    <img
                      src={getFullUrl(podcast.coverImage)}
                      alt={podcast.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-5xl">🎙️</div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🎙️</div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 shadow-lg">
                      <Play className="w-5 h-5 text-gray-900 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-gray-700 transition">
                    {podcast.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {podcast.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center space-x-1">
                      <Play className="w-3.5 h-3.5" />
                      <span>{podcast.episodeCount || 0} eps</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{podcast.subscriberCount || 0}</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {podcasts.map((podcast) => (
              <Link
                key={podcast._id}
                to={`/listener/podcasts/${podcast._id}`}
                className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-6 p-6">
                  {/* Cover Image */}
                  <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {podcast.coverImage ? (
                      <img
                        src={getFullUrl(podcast.coverImage)}
                        alt={podcast.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-4xl">🎙️</div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🎙️</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition">
                      {podcast.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                      {podcast.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Play className="w-4 h-4" />
                        <span className="font-medium">{podcast.episodeCount || 0}</span>
                        <span>episodes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{podcast.subscriberCount || 0}</span>
                        <span>subscribers</span>
                      </span>
                      {podcast.categoryId?.name && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {podcast.categoryId.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePodcasts;
