import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { Link } from 'react-router-dom';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Music,
  Eye,
  Filter,
  Search,
  Calendar,
  User
} from 'lucide-react';

const API_BASE = 'http://localhost:7007';

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

const AllEpisodes = () => {
  const { adminGetAllEpisodes, adminApproveEpisode, adminRejectEpisode } = useAuth();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [search, setSearch] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      const data = await adminGetAllEpisodes();
      console.log('All episodes:', data);
      setEpisodes(data || []);
    } catch (error) {
      console.error('Load error:', error);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (episode) => {
    setActionLoading(episode._id + '-approve');
    try {
      await adminApproveEpisode(episode._id);
      setEpisodes(prev => prev.map(ep => 
        ep._id === episode._id 
          ? { ...ep, approvalStatus: 'approved', isPublished: true, status: 'published' }
          : ep
      ));
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (episode) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    setActionLoading(episode._id + '-reject');
    try {
      await adminRejectEpisode(episode._id, rejectReason);
      setEpisodes(prev => prev.map(ep => 
        ep._id === episode._id 
          ? { ...ep, approvalStatus: 'rejected', isPublished: false, status: 'rejected', rejectionReason: rejectReason }
          : ep
      ));
      setShowRejectModal(null);
      setRejectReason('');
    } catch (error) {
      console.error('Reject error:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEpisodes = episodes.filter(ep => {
    const matchesFilter = filter === 'all' || ep.approvalStatus === filter;
    const matchesSearch = !search || 
      ep.title?.toLowerCase().includes(search.toLowerCase()) ||
      ep.podcastId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      ep.creatorId?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (episode) => {
    if (episode.isPublished && episode.approvalStatus === 'approved') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ Approved</span>;
    }
    if (episode.approvalStatus === 'pending') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">⏳ Pending</span>;
    }
    if (episode.approvalStatus === 'rejected') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">✗ Rejected</span>;
    }
    return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">📝 Draft</span>;
  };

  const stats = {
    total: episodes.length,
    pending: episodes.filter(e => e.approvalStatus === 'pending').length,
    approved: episodes.filter(e => e.approvalStatus === 'approved').length,
    rejected: episodes.filter(e => e.approvalStatus === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Episodes</h1>
        <p className="text-gray-500">Manage and review all podcast episodes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Episodes</p>
            <Music className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-yellow-700">Pending Review</p>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-700">Approved</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
        </div>
        
        <div className="bg-red-50 rounded-xl border border-red-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-700">Rejected</p>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search episodes, podcasts, or creators..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : filteredEpisodes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Music className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No episodes found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Episode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Podcast
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEpisodes.map(episode => (
                  <tr key={episode._id} className="hover:bg-gray-50 transition">
                    {/* Episode */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {episode.thumbnail || episode.podcastId?.coverImage ? (
                            <img
                              src={getFullUrl(episode.thumbnail || episode.podcastId?.coverImage)}
                              alt={episode.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-lg">🎧</span></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {episode.title}
                          </p>
                          {episode.formattedDuration && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {episode.formattedDuration}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Podcast */}
                    <td className="px-6 py-4">
                      {episode.podcastId ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {episode.podcastId.title}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>

                    {/* Creator */}
                    <td className="px-6 py-4">
                      {episode.creatorId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {episode.creatorId.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {episode.creatorId.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {episode.creatorId.email}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unknown</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(episode)}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(episode.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {episode.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(episode)}
                              disabled={actionLoading === episode._id + '-approve'}
                              className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition disabled:opacity-50"
                            >
                              {actionLoading === episode._id + '-approve' ? (
                                <div className="w-4 h-4 border-2 border-green-200 border-t-green-700 rounded-full animate-spin" />
                              ) : (
                                'Approve'
                              )}
                            </button>
                            <button
                              onClick={() => setShowRejectModal(episode)}
                              disabled={actionLoading === episode._id + '-reject'}
                              className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <Link
                          to={`/listener/episodes/${episode._id}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
                          title="View episode"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowRejectModal(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Episode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting "{showRejectModal.title}"
              </p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-100 transition resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  disabled={!rejectReason.trim() || actionLoading === showRejectModal._id + '-reject'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {actionLoading === showRejectModal._id + '-reject' ? 'Rejecting...' : 'Reject Episode'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllEpisodes;
