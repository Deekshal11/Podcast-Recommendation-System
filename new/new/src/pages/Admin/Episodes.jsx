import { useEffect, useState, Fragment } from 'react';
import { useAuth } from '../../context/Context';
import { Dialog, Transition } from '@headlessui/react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  X,
  Music,
  Video,
  FileText,
  User,
  Calendar,
  Tag,
  Hash,
  PlayCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:7007'; // ✅ Add base URL

const AdminEpisodesPending = () => {
  const { fetchPendingEpisodes, approveEpisode, rejectEpisode } = useAuth();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // ✅ Helper to get full URL
  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  const loadEpisodes = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingEpisodes();
      setEpisodes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEpisodes();
  }, []); // eslint-disable-line

  const openPreview = (ep) => {
    setSelectedEpisode(ep);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setSelectedEpisode(null);
  };

  const openRejectModal = (ep) => {
    setSelectedEpisode(ep);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedEpisode(null);
    setRejectReason('');
  };

  const handleApprove = async (ep) => {
    setActionLoading(ep._id + '-approve');
    try {
      await approveEpisode(ep._id);
      setEpisodes(prev => prev.filter(e => e._id !== ep._id));
      closePreview();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setActionLoading(selectedEpisode._id + '-reject');
    try {
      await rejectEpisode(selectedEpisode._id, rejectReason);
      setEpisodes(prev => prev.filter(e => e._id !== selectedEpisode._id));
      closeRejectModal();
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: episodes.length,
    hasVideo: episodes.filter(e => e.videoUrl).length,
    hasTranscript: episodes.filter(e => e.hasTranscript).length
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Episode Approvals</h1>
          <p className="text-gray-500">Review and approve pending episodes</p>
        </div>
        
        {/* Stats */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.hasVideo}</div>
            <div className="text-xs text-gray-500">Video</div>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.hasTranscript}</div>
            <div className="text-xs text-gray-500">Transcript</div>
          </div>
        </div>
      </div>

      {/* Episodes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">All caught up!</h3>
            <p className="text-sm text-gray-500">No pending episodes to review</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {episodes.map(ep => (
              <div key={ep._id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  {/* Episode Info */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-start space-x-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {ep.thumbnail ? (
                          <img 
                            src={getFullUrl(ep.thumbnail)} 
                            alt={ep.title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Music className="w-8 h-8 text-blue-600" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{ep.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ep.description}</p>
                        
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span className="font-medium">{ep.podcastId?.title || 'Unknown Podcast'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{ep.creatorId?.name || 'Unknown'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Hash className="w-3 h-3" />
                            <span>S{ep.seasonNumber || 1}E{ep.episodeNumber || 1}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(ep.createdAt).toLocaleDateString()}</span>
                          </span>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center space-x-2 mt-3">
                          {ep.videoUrl && (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-semibold">
                              <Video className="w-3 h-3" />
                              <span>Video</span>
                            </span>
                          )}
                          {ep.audioUrl && (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                              <Music className="w-3 h-3" />
                              <span>Audio</span>
                            </span>
                          )}
                          {ep.hasTranscript && (
                            <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-semibold">
                              <FileText className="w-3 h-3" />
                              <span>Transcript</span>
                            </span>
                          )}
                          {ep.isExplicit && (
                            <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-semibold">
                              Explicit
                            </span>
                          )}
                          {ep.isPremium && (
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-semibold">
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 flex-shrink-0">
                    <button
                      onClick={() => openPreview(ep)}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleApprove(ep)}
                      disabled={actionLoading === ep._id + '-approve'}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => openRejectModal(ep)}
                      disabled={actionLoading === ep._id + '-reject'}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ ENHANCED Preview Modal with Media Players */}
      <Transition appear show={isPreviewOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closePreview}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  {selectedEpisode && (
                    <>
                      {/* Header */}
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <Dialog.Title className="text-xl font-bold text-gray-900">Episode Preview</Dialog.Title>
                        <button onClick={closePreview} className="p-2 hover:bg-gray-100 rounded-lg transition">
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      {/* Body */}
                      <div className="px-6 py-6 max-h-[75vh] overflow-y-auto space-y-6">
                        {/* Thumbnail Preview */}
                        {selectedEpisode.thumbnail && (
                          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                            <img 
                              src={getFullUrl(selectedEpisode.thumbnail)} 
                              alt={selectedEpisode.title}
                              className="w-full h-64 object-cover"
                            />
                          </div>
                        )}

                        {/* Title & Description */}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedEpisode.title}</h2>
                          <p className="text-gray-700">{selectedEpisode.description}</p>
                        </div>

                        {/* ✅ Video Player */}
                        {selectedEpisode.videoUrl && (
                          <div className="bg-black rounded-xl overflow-hidden">
                            <video 
                              controls 
                              className="w-full"
                              src={getFullUrl(selectedEpisode.videoUrl)}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        )}

                        {/* ✅ Audio Player */}
                        {selectedEpisode.audioUrl && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Music className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">Audio Episode</div>
                                <div className="text-xs text-gray-500">
                                  {selectedEpisode.audioFormat?.toUpperCase()} • {(selectedEpisode.audioFileSize / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                            </div>
                            <audio 
                              controls 
                              className="w-full"
                              src={getFullUrl(selectedEpisode.audioUrl)}
                            >
                              Your browser does not support the audio tag.
                            </audio>
                          </div>
                        )}

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Podcast</div>
                            <div className="text-sm font-medium text-gray-900">{selectedEpisode.podcastId?.title || '-'}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Creator</div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedEpisode.creatorId?.name || '-'}
                              <div className="text-xs text-gray-500">{selectedEpisode.creatorId?.email}</div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Episode #</div>
                            <div className="text-sm font-medium text-gray-900">
                              Season {selectedEpisode.seasonNumber || 1}, Episode {selectedEpisode.episodeNumber || 1}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Submitted</div>
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(selectedEpisode.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        {selectedEpisode.tags && selectedEpisode.tags.length > 0 && (
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                              <Tag className="w-4 h-4" />
                              <span>Tags</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedEpisode.tags.map((tag, idx) => (
                                <span 
                                  key={idx}
                                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Show Notes */}
                        {selectedEpisode.showNotes && (
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">Show Notes</div>
                            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                              {selectedEpisode.showNotes}
                            </div>
                          </div>
                        )}

                        {/* Transcript */}
                        {selectedEpisode.transcript && (
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">Transcript</div>
                            <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto whitespace-pre-wrap">
                              {selectedEpisode.transcript}
                            </div>
                          </div>
                        )}

                        {/* File URLs (for debugging/verification) */}
                        <div className="border-t border-gray-200 pt-4">
                          <div className="text-xs font-semibold text-gray-500 uppercase mb-3">File URLs</div>
                          <div className="space-y-2">
                            {selectedEpisode.audioUrl && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Audio:</span>
                                <a 
                                  href={getFullUrl(selectedEpisode.audioUrl)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate max-w-xs"
                                >
                                  {selectedEpisode.audioUrl}
                                </a>
                              </div>
                            )}
                            {selectedEpisode.videoUrl && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Video:</span>
                                <a 
                                  href={getFullUrl(selectedEpisode.videoUrl)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate max-w-xs"
                                >
                                  {selectedEpisode.videoUrl}
                                </a>
                              </div>
                            )}
                            {selectedEpisode.thumbnail && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Thumbnail:</span>
                                <a 
                                  href={getFullUrl(selectedEpisode.thumbnail)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate max-w-xs"
                                >
                                  {selectedEpisode.thumbnail}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={closePreview}
                          className="px-5 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-white transition"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => {
                            closePreview();
                            openRejectModal(selectedEpisode);
                          }}
                          className="flex items-center space-x-2 px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleApprove(selectedEpisode)}
                          disabled={actionLoading === selectedEpisode._id + '-approve'}
                          className="flex items-center space-x-2 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{actionLoading ? 'Approving...' : 'Approve'}</span>
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Reject Modal */}
      <Transition appear show={isRejectModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeRejectModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  <div className="px-6 py-6">
                    <Dialog.Title className="text-xl font-bold text-gray-900 mb-4">Reject Episode</Dialog.Title>
                    <p className="text-sm text-gray-600 mb-4">
                      Please provide a reason for rejecting this episode. The creator will see this message.
                    </p>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 transition resize-none"
                      rows={4}
                      placeholder="e.g., Audio quality is poor, content violates guidelines..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                    />
                    <div className="flex items-center justify-end space-x-3 mt-6">
                      <button
                        onClick={closeRejectModal}
                        className="px-5 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReject}
                        disabled={!rejectReason.trim() || actionLoading}
                        className="flex items-center space-x-2 px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{actionLoading ? 'Rejecting...' : 'Reject Episode'}</span>
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AdminEpisodesPending;
