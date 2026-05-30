import { useState, useEffect } from 'react';
import { useAuth } from '../../context/Context';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft, Upload, Link as LinkIcon, FileUp, Image } from 'lucide-react';

const PodcastForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const {
    createPodcast,
    updatePodcast,
    fetchCreatorPodcastById,
    fetchListenerCategories
  } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  // ✅ File upload states
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverMode, setCoverMode] = useState('link'); // 'link' or 'upload'

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

useEffect(() => {
  const load = async () => {
    try {
      const cats = await fetchListenerCategories();
      setCategories(cats);

      if (isEdit) {
        const podcast = await fetchCreatorPodcastById(id);
        
        // ✅ Set form values properly
        Object.keys(podcast).forEach(key => {
          if (key === 'tags' && Array.isArray(podcast.tags)) {
            setValue(key, podcast.tags.join(', ')); // Convert array to string
          } else if (key === 'categoryId' && podcast.categoryId?._id) {
            setValue(key, podcast.categoryId._id); // Extract ID from populated field
          } else {
            setValue(key, podcast[key]);
          }
        });
      }
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load podcast data'); // ✅ Show error to user
    } finally {
      setLoading(false);
    }
  };
  load();
}, [id, isEdit]); // ✅ Remove other dependencies to avoid warning

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // ✅ Create FormData if file uploaded
      let submitData;
      if (coverImageFile) {
        submitData = new FormData();
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            submitData.append(key, data[key]);
          }
        });
        submitData.append('coverImage', coverImageFile);
      } else {
        submitData = data;
      }
      
      if (isEdit) {
        await updatePodcast(id, submitData);
      } else {
        await createPodcast(submitData);
      }
      navigate('/creator/podcasts');
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/creator/podcasts')}
          className="p-2 hover:bg-gray-100 rounded-xl transition"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Podcast' : 'Create New Podcast'}
          </h1>
          <p className="text-gray-500">Fill in the details below</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Podcast Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            placeholder="Enter podcast title"
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
            placeholder="Describe your podcast"
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        {/* Category & Language */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              {...register('categoryId')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <input
              {...register('language')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
              placeholder="e.g., English"
            />
          </div>
        </div>

        {/* ✅ Cover Image with Toggle */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-dashed border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Cover Image</h3>
                <p className="text-sm text-gray-600">Upload or provide link (JPG, PNG)</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1">
              <button
                type="button"
                onClick={() => setCoverMode('link')}
                className={`px-3 py-1 rounded text-sm font-semibold transition ${
                  coverMode === 'link' ? 'bg-green-500 text-white' : 'text-gray-600'
                }`}
              >
                <LinkIcon className="w-4 h-4 inline mr-1" />
                Link
              </button>
              <button
                type="button"
                onClick={() => setCoverMode('upload')}
                className={`px-3 py-1 rounded text-sm font-semibold transition ${
                  coverMode === 'upload' ? 'bg-green-500 text-white' : 'text-gray-600'
                }`}
              >
                <FileUp className="w-4 h-4 inline mr-1" />
                Upload
              </button>
            </div>
          </div>
          
          {coverMode === 'link' ? (
            <input
              {...register('coverImage')}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition"
              placeholder="https://example.com/cover.jpg"
            />
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImageFile(e.target.files[0])}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-500 file:text-white file:cursor-pointer hover:file:bg-green-600 transition"
              />
              {coverImageFile && (
                <div className="mt-2 p-2 bg-green-100 rounded-lg text-sm text-green-700">
                  ✓ {coverImageFile.name} ({(coverImageFile.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
          <input
            {...register('tags')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition"
            placeholder="tech, comedy, education"
          />
          <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
        </div>

        {/* Explicit & Premium */}
        <div className="flex items-center space-x-6">
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
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/creator/podcasts')}
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : isEdit ? 'Update Podcast' : 'Create Podcast'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PodcastForm;
