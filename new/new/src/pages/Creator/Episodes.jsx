import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Send, Play } from 'lucide-react';

const MyEpisodes = () => {
  const { fetchCreatorEpisodes, deleteEpisode, publishEpisode, fetchCreatorPodcasts } = useAuth();
  const [episodes, setEpisodes] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [filter, setFilter] = useState({ podcastId: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [eps, pods] = await Promise.all([
        fetchCreatorEpisodes(filter),
        fetchCreatorPodcasts()
      ]);
      setEpisodes(eps);
      setPodcasts(pods);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line

  const handleApplyFilter = () => {
    loadData();
  };

  const handleDelete = async (ep) => {
    if (!window.confirm(`Delete "${ep.title}"?`)) return;
    setActionLoading(ep._id + '-delete');
    try {
      await deleteEpisode(ep._id);
      setEpisodes(prev => prev.filter(e => e._id !== ep._id));
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (ep) => {
    setActionLoading(ep._id + '-publish');
    try {
      const updated = await publishEpisode(ep._id);
      setEpisodes(prev => prev.map(e => (e._id === ep._id ? updated : e)));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status, approvalStatus) => {
    if (approvalStatus === 'approved') return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Approved</span>;
    if (approvalStatus === 'pending') return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Pending</span>;
    if (approvalStatus === 'rejected') return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Rejected</span>;
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Draft</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Episodes</h1>
          <p className="text-gray-500">Manage all your podcast episodes</p>
        </div>
        <Link
          to="/creator/episodes/new"
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Episode</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Podcast</label>
          <select
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            value={filter.podcastId}
            onChange={e => setFilter(prev => ({ ...prev, podcastId: e.target.value }))}
          >
            <option value="">All Podcasts</option>
            {podcasts.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
          <select
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            value={filter.status}
            onChange={e => setFilter(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="published">Published</option>
          </select>
        </div>

        <button
          onClick={handleApplyFilter}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          Apply
        </button>
      </div>

      {/* Episodes List */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No episodes yet</h3>
            <p className="text-gray-500 mb-6">Upload your first episode to get started</p>
            <Link
              to="/creator/episodes/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Upload Episode</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Podcast</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Plays</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {episodes.map(ep => (
                  <tr key={ep._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{ep.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{ep.description}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{ep.podcastId?.title || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{ep.formattedDuration || '-'}</td>
                    <td className="px-6 py-4 text-gray-700">{ep.plays || 0}</td>
                    <td className="px-6 py-4">{getStatusBadge(ep.status, ep.approvalStatus)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/creator/episodes/${ep._id}/edit`}
                        className="inline-flex items-center px-3 py-1 text-xs bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                      {ep.approvalStatus === 'draft' && (
                        <button
                          onClick={() => handlePublish(ep)}
                          disabled={actionLoading === ep._id + '-publish'}
                          className="inline-flex items-center px-3 py-1 text-xs bg-green-50 text-green-700 font-semibold rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(ep)}
                        disabled={actionLoading === ep._id + '-delete'}
                        className="inline-flex items-center px-3 py-1 text-xs bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEpisodes;
