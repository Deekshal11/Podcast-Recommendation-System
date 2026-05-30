import { useEffect, useState, Fragment } from 'react';
import { useAuth } from '../../context/Context';
import { Dialog, Transition } from '@headlessui/react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  FolderTree,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const AdminCategories = () => {
  const {
    fetchCategories,
    createCategory,
    updateCategory,
    toggleCategoryActive,
    deleteCategory
  } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3b82f6',
    icon: '📁',
    displayOrder: 0,
    isFeatured: false,
    parentId: ''
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []); // eslint-disable-line

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      color: '#3b82f6',
      icon: '📁',
      displayOrder: 0,
      isFeatured: false,
      parentId: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      color: cat.color || '#3b82f6',
      icon: cat.icon || '📁',
      displayOrder: cat.displayOrder || 0,
      isFeatured: cat.isFeatured || false,
      parentId: cat.parentId || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setForm(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory._id, form);
        setCategories(prev => prev.map(c => c._id === editingCategory._id ? updated : c));
      } else {
        const created = await createCategory(form);
        setCategories(prev => [...prev, created]);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat) => {
    const updated = await toggleCategoryActive(cat._id, !cat.isActive);
    setCategories(prev => prev.map(c => c._id === cat._id ? updated : c));
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    await deleteCategory(cat._id);
    setCategories(prev => prev.filter(c => c._id !== cat._id));
  };

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    featured: categories.filter(c => c.isFeatured).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Categories</h1>
          <p className="text-gray-500">Manage podcast categories and organization</p>
        </div>
        
        {/* Stats + Create Button */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
          </div>
          
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No categories yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first category to organize podcasts</p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(cat => {
                  const parent = categories.find(c => c._id === cat.parentId);
                  return (
                    <tr key={cat._id} className="hover:bg-gray-50 transition">
                      {/* Category Name */}
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: cat.color + '20' }}
                          >
                            {cat.icon || '📁'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{cat.name}</div>
                            {cat.description && (
                              <div className="text-xs text-gray-500 line-clamp-1">{cat.description}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-6 py-3">
                        <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                          {cat.slug}
                        </code>
                      </td>

                      {/* Parent */}
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {parent ? (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {parent.name}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Display Order */}
                      <td className="px-6 py-3 text-sm text-gray-600">{cat.displayOrder || 0}</td>

                      {/* Status */}
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(cat)}
                            className="group"
                          >
                            {cat.isActive ? (
                              <ToggleRight className="w-10 h-10 text-green-600 hover:text-green-700 transition" />
                            ) : (
                              <ToggleLeft className="w-10 h-10 text-gray-300 hover:text-gray-400 transition" />
                            )}
                          </button>
                          <span className={`text-xs font-semibold ${cat.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                            {cat.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3 text-right space-x-2">
                        {/* <button
                          onClick={() => openEditModal(cat)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button> */}
                        <button
                          onClick={() => handleDelete(cat)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <Dialog.Title className="text-xl font-bold text-gray-900">
                      {editingCategory ? 'Edit Category' : 'Create New Category'}
                    </Dialog.Title>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                    {/* Name & Icon */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                          placeholder="e.g., Technology"
                          value={form.name}
                          onChange={e => handleChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-center text-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                          placeholder="📁"
                          value={form.icon}
                          onChange={e => handleChange('icon', e.target.value)}
                          maxLength={2}
                        />
                      </div>
                    </div>

                    {/* Slug (Auto-generated) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Slug (auto-generated)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
                        value={form.slug}
                        readOnly
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                        rows={3}
                        placeholder="Brief description of this category..."
                        value={form.description}
                        onChange={e => handleChange('description', e.target.value)}
                      />
                    </div>

                    {/* Color, Order, Parent */}
                    <div className="grid grid-cols-3 gap-4">
                      {/* <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                        <input
                          type="color"
                          className="w-full h-10 p-1 border border-gray-200 rounded-lg cursor-pointer"
                          value={form.color}
                          onChange={e => handleChange('color', e.target.value)}
                        />
                      </div> */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                          value={form.displayOrder}
                          onChange={e => handleChange('displayOrder', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Category</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                          value={form.parentId}
                          onChange={e => handleChange('parentId', e.target.value)}
                        >
                          <option value="">None</option>
                          {categories.filter(c => !c.parentId && c._id !== editingCategory?._id).map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Featured Toggle */}
                    <div className="flex items-center space-x-3 pt-2">
                      <input
                        id="featured-modal"
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={e => handleChange('isFeatured', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="featured-modal" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Featured Category (Show on homepage)
                      </label>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-5 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AdminCategories;
