import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { Link } from 'react-router-dom';
import { Plus, List, Play, Trash2, Clock, Music } from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const Playlists = () => {
  const { fetchPlaylists, createPlaylist, deletePlaylist } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', isPublic: false });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPlaylists();
        console.log('Playlists data:', data);
        setPlaylists(data || []);
      } catch (error) {
        console.error('Load error:', error);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchPlaylists]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setCreating(true);
    try {
      const newPlaylist = await createPlaylist(formData);
      setPlaylists(prev => [newPlaylist, ...prev]);
      setFormData({ name: '', description: '', isPublic: false });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Create error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this playlist? This action cannot be undone.')) return;
    try {
      await deletePlaylist(id);
      setPlaylists(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Playlists</h1>
            <p className="text-gray-500 text-lg">Organize your favorite episodes</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Playlist</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Playlist Name *
                </label>
                <input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition"
                  placeholder="My Favorite Episodes"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition resize-none"
                  placeholder="Describe your playlist..."
                />
              </div>
              {/* <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={e => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <span className="text-sm font-medium text-gray-700">Make this playlist public</span>
              </label> */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 border border-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.name.trim()}
                  className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <List className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No playlists yet</h3>
            <p className="text-gray-500 mb-6">Create your first playlist to organize episodes</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Playlist</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(playlist => (
              <div
                key={playlist._id}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Playlist Header */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                    <List className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{playlist.name}</h3>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {playlist.description || 'No description'}
                  </p>
                </div>

                {/* Episodes Preview */}
                <div className="p-6">
                  {playlist.episodes && playlist.episodes.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {playlist.episodes.slice(0, 3).map((ep) => (
                        <Link
                          key={ep._id}
                          to={`/listener/episodes/${ep._id}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition text-sm"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {ep.thumbnail || ep.podcastId?.coverImage ? (
                              <img 
                                src={getFullUrl(ep.thumbnail || ep.podcastId?.coverImage)} 
                                alt={ep.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-lg">🎧</div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Music className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{ep.title}</p>
                            {ep.formattedDuration && (
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{ep.formattedDuration}</span>
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                      {playlist.episodes.length > 3 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{playlist.episodes.length - 3} more episodes
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No episodes yet</p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
                    <span className="font-medium">{playlist.episodes?.length || 0} episodes</span>
                    {playlist.isPublic && (
                      <>
                        <span>•</span>
                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full font-semibold">
                          Public
                        </span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/listener/playlists/${playlist._id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition"
                    >
                      <Play className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(playlist._id)}
                      className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-full hover:bg-red-100 transition"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-4 h-4" />
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

export default Playlists;
