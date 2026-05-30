import { useState, useEffect } from 'react';
import { useAuth } from '../../context/Context';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft, Music, Video, Image, Link as LinkIcon, FileUp } from 'lucide-react';

const EpisodeForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const {
    createEpisode,
    updateEpisode,
    fetchCreatorEpisodeById,
    fetchCreatorPodcasts
  } = useAuth();

  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ✅ File upload states
  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [audioMode, setAudioMode] = useState('link'); // 'link' or 'upload'
  const [videoMode, setVideoMode] = useState('link');
  const [thumbnailMode, setThumbnailMode] = useState('link');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const videoUrl = watch('videoUrl');

  useEffect(() => {
    const load = async () => {
      const pods = await fetchCreatorPodcasts();
      setPodcasts(pods);

      if (isEdit) {
        try {
          const episode = await fetchCreatorEpisodeById(id);
          Object.keys(episode).forEach(key => {
            setValue(key, episode[key]);
          });
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [id, isEdit]); // eslint-disable-line

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // ✅ Create FormData for file uploads
      let submitData;
      
      if (audioFile || videoFile || thumbnailFile) {
        submitData = new FormData();
        
        // Add all form fields
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
            submitData.append(key, data[key]);
          }
        });
        
        // Add files
        if (audioFile) submitData.append('audio', audioFile);
        if (videoFile) submitData.append('video', videoFile);
        if (thumbnailFile) submitData.append('thumbnail', thumbnailFile);
      } else {
        // No files, use regular data
        submitData = data;
        // Convert tags string to array
        if (data.tags && typeof data.tags === 'string') {
          submitData.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean);
        }
      }

      if (isEdit) {
        await updateEpisode(id, submitData);
      } else {
        await createEpisode(submitData);
      }
      navigate('/creator/episodes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/creator/episodes')}
          className="p-2 hover:bg-gray-100 rounded-xl transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Episode' : 'Upload New Episode'}
          </h1>
          <p className="text-gray-500">Fill in episode details and upload your media</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Basic Information</h2>

          {/* Podcast Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Podcast <span className="text-red-500">*</span>
            </label>
            <select
              {...register('podcastId', { required: 'Podcast is required' })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            >
              <option value="">Choose a podcast</option>
              {podcasts.map(p => (
                <option key={p._id} value={p._id}>{p.title}</option>
              ))}
            </select>
            {errors.podcastId && <p className="text-xs text-red-500 mt-1">{errors.podcastId.message}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Episode Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              placeholder="Enter episode title"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={5}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              placeholder="Describe what this episode is about"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          {/* Episode & Season Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Episode Number</label>
              <input
                type="number"
                {...register('episodeNumber')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Season Number</label>
              <input
                type="number"
                {...register('seasonNumber')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="1"
              />
            </div>
          </div>
        </div>

        {/* Media Upload Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Media Files</h2>

          {/* ✅ Audio Upload with Toggle */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-dashed border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Audio File *</h3>
                  <p className="text-sm text-gray-600">Upload or provide link (MP3, WAV, M4A)</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setAudioMode('link')}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    audioMode === 'link' ? 'bg-blue-500 text-white' : 'text-gray-600'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setAudioMode('upload')}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    audioMode === 'upload' ? 'bg-blue-500 text-white' : 'text-gray-600'
                  }`}
                >
                  <FileUp className="w-4 h-4 inline mr-1" />
                  Upload
                </button>
              </div>
            </div>
            
            {audioMode === 'link' ? (
              <input
                {...register('audioUrl')}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="https://example.com/episode.mp3"
              />
            ) : (
              <div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setAudioFile(e.target.files[0])}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600 transition"
                />
                {audioFile && (
                  <div className="mt-2 p-2 bg-blue-100 rounded-lg text-sm text-blue-700">
                    ✓ {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Audio Format</label>
                <input
                  {...register('audioFormat')}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  placeholder="mp3"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bitrate</label>
                <input
                  {...register('audioBitrate')}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                  placeholder="128kbps"
                />
              </div>
            </div>
          </div>

          {/* ✅ Video Upload with Toggle (Optional) */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-dashed border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Video File (Optional)</h3>
                  <p className="text-sm text-gray-600">For video podcasts (MP4, WebM)</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setVideoMode('link')}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    videoMode === 'link' ? 'bg-purple-500 text-white' : 'text-gray-600'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('upload')}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    videoMode === 'upload' ? 'bg-purple-500 text-white' : 'text-gray-600'
                  }`}
                >
                  <FileUp className="w-4 h-4 inline mr-1" />
                  Upload
                </button>
              </div>
            </div>
            
            {videoMode === 'link' ? (
              <input
                {...register('videoUrl')}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition"
                placeholder="https://example.com/episode.mp4"
              />
            ) : (
              <div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white file:cursor-pointer hover:file:bg-purple-600 transition"
                />
                {videoFile && (
                  <div className="mt-2 p-2 bg-purple-100 rounded-lg text-sm text-purple-700">
                    ✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            )}
            {(videoUrl || videoFile) && (
              <div className="mt-3 p-3 bg-purple-100 rounded-lg">
                <p className="text-xs text-purple-700 font-semibold">✓ Video podcast detected - viewers will see video player</p>
              </div>
            )}
          </div>

          {/* ✅ Thumbnail Upload with Toggle */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-dashed border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Episode Thumbnail (Optional)</h3>
                  <p className="text-sm text-gray-600">Custom thumbnail image (JPG, PNG)</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setThumbnailMode('link')}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    thumbnailMode === 'link' ? 'bg-green-500 text-white' : 'text-gray-600'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  Link
                </button>
                <button
                  type="button"
                  onClick={() => setThumbnailMode('upload')}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    thumbnailMode === 'upload' ? 'bg-green-500 text-white' : 'text-gray-600'
                  }`}
                >
                  <FileUp className="w-4 h-4 inline mr-1" />
                  Upload
                </button>
              </div>
            </div>
            
            {thumbnailMode === 'link' ? (
              <input
                {...register('thumbnail')}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition"
                placeholder="https://example.com/thumbnail.jpg"
              />
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-500 file:text-white file:cursor-pointer hover:file:bg-green-600 transition"
                />
                {thumbnailFile && (
                  <div className="mt-2 p-2 bg-green-100 rounded-lg text-sm text-green-700">
                    ✓ {thumbnailFile.name} ({(thumbnailFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (in seconds)</label>
            <input
              type="number"
              {...register('duration')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              placeholder="3600 (1 hour)"
            />
            <p className="text-xs text-gray-500 mt-1">Enter duration in seconds (e.g., 3600 = 1 hour)</p>
          </div>
        </div>

        {/* Advanced Options (Collapsible) */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <h2 className="text-xl font-bold text-gray-900">Advanced Options</h2>
            <span className={`text-gray-500 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showAdvanced && (
            <div className="px-8 pb-8 pt-4 space-y-6 border-t border-gray-200">
              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  {...register('tags')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  placeholder="tech, interview, startup"
                />
              </div>

              {/* Show Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Show Notes</label>
                <textarea
                  {...register('showNotes')}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  placeholder="Links, timestamps, resources mentioned in the episode..."
                />
              </div>

              {/* Transcript */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Transcript (Optional)</label>
                <textarea
                  {...register('transcript')}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  placeholder="Full episode transcript..."
                />
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isExplicit')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Explicit Content</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isPremium')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Premium Only</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isTrailer')}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Trailer Episode</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('allowComments')}
                    defaultChecked
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow Comments</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('allowDownloads')}
                    defaultChecked
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow Downloads</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('allowSharing')}
                    defaultChecked
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Allow Sharing</span>
                </label>
              </div>

              {/* Copyright */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Copyright Notice</label>
                <input
                  {...register('copyright')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
                  placeholder="© 2025 Your Name. All rights reserved."
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/creator/episodes')}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : isEdit ? 'Update Episode' : 'Create Episode'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EpisodeForm;
