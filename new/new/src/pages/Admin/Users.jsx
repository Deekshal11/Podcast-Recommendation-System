import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { 
  Users as UsersIcon, 
  Search, 
  Shield, 
  Ban, 
  Trash2, 
  UserCheck
} from 'lucide-react';

const roleOptions = [
  { label: 'All Roles', value: '' },
  { label: 'Listener', value: 'LISTENER' },
  { label: 'Creator', value: 'CREATOR' },
  { label: 'Admin', value: 'ADMIN' }
];

const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Blocked', value: 'BLOCKED' }
];

const AdminUsers = () => {
  const {
    fetchAdminUsers,
    blockUser,
    unblockUser,
    updateUserRole,
    deleteUserByAdmin
  } = useAuth();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 });
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Clean filters - remove empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const res = await fetchAdminUsers(cleanFilters);
      setUsers(res);
      
      // Calculate stats
      setStats({
        total: res.length,
        active: res.filter(u => u.status === 'ACTIVE').length,
        blocked: res.filter(u => u.status === 'BLOCKED').length
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-apply filters when they change
  useEffect(() => {
    loadUsers();
  }, [filters]); // eslint-disable-line

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleBlockToggle = async (user) => {
    setActionLoading(user._id);
    try {
      if (user.status === 'ACTIVE') {
        const updated = await blockUser(user._id);
        setUsers(prev => prev.map(u => (u._id === user._id ? updated : u)));
      } else {
        const updated = await unblockUser(user._id);
        setUsers(prev => prev.map(u => (u._id === user._id ? updated : u)));
      }
      // Update stats
      setStats(prev => ({
        ...prev,
        active: prev.active + (user.status === 'ACTIVE' ? -1 : 1),
        blocked: prev.blocked + (user.status === 'ACTIVE' ? 1 : -1)
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    setActionLoading(user._id + '-role');
    try {
      const updated = await updateUserRole(user._id, newRole);
      setUsers(prev => prev.map(u => (u._id === user._id ? updated : u)));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    setActionLoading(user._id + '-delete');
    try {
      await deleteUserByAdmin(user._id);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      setStats(prev => ({
        total: prev.total - 1,
        active: prev.active - (user.status === 'ACTIVE' ? 1 : 0),
        blocked: prev.blocked - (user.status === 'BLOCKED' ? 1 : 0)
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CREATOR': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LISTENER': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Users Management</h1>
          <p className="text-gray-500">View and manage all users</p>
        </div>
        
        {/* Compact Stats */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="w-px h-10 bg-gray-200"></div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
            <div className="text-xs text-gray-500">Blocked</div>
          </div>
        </div>
      </div>

      {/* Filters - Auto Apply */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                placeholder="Search users..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              value={filters.role}
              onChange={e => handleFilterChange('role', e.target.value)}
            >
              {roleOptions.map(r => (
                <option key={r.value || 'all-role'} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
            >
              {statusOptions.map(s => (
                <option key={s.value || 'all-status'} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    {/* User */}
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
                          {getInitials(user.name)}
                        </div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-3 text-sm text-gray-600">{user.email}</td>

                    {/* Role */}
                    <td className="px-6 py-3">
                      <select
                        className={`px-2 py-1 border rounded-lg text-xs font-semibold transition ${getRoleBadgeColor(user.role)}`}
                        value={user.role}
                        disabled={actionLoading === user._id + '-role'}
                        onChange={e => handleRoleChange(user, e.target.value)}
                      >
                        <option value="LISTENER">Listener</option>
                        <option value="CREATOR">Creator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'ACTIVE' ? <UserCheck className="w-3 h-3 mr-1" /> : <Ban className="w-3 h-3 mr-1" />}
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleBlockToggle(user)}
                        disabled={actionLoading === user._id}
                        className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-lg transition ${
                          user.status === 'ACTIVE'
                            ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        } disabled:opacity-50`}
                      >
                        {user.status === 'ACTIVE' ? (
                          <><Ban className="w-3 h-3" /><span>Block</span></>
                        ) : (
                          <><Shield className="w-3 h-3" /><span>Unblock</span></>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(user)}
                        disabled={actionLoading === user._id + '-delete'}
                        className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
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

export default AdminUsers;
