import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { 
  Users, 
  Briefcase, 
  Shield, 
  Podcast, 
  Music, 
  Clock,
  TrendingUp,
  Activity,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const StatCard = ({ label, value, icon: Icon, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <TrendingUp className="w-5 h-5 text-gray-400" />
    </div>
    <span className="text-sm font-medium text-gray-500 block mb-1">{label}</span>
    <span className="text-3xl font-bold text-gray-900">{value?.toLocaleString()}</span>
  </div>
);

const AdminDashboard = () => {
  const { fetchAdminDashboard } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAdminDashboard();
        console.log('Admin dashboard data:', data);
        setStats(data);
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchAdminDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-500 text-lg">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const userDistribution = [
    { name: 'Listeners', value: stats.totalUsers - stats.totalCreators - stats.totalAdmins, color: '#3b82f6' },
    { name: 'Creators', value: stats.totalCreators, color: '#8b5cf6' },
    { name: 'Admins', value: stats.totalAdmins, color: '#10b981' }
  ];

  const contentData = [
    { name: 'Podcasts', total: stats.totalPodcasts, pending: 0 },
    { name: 'Episodes', total: stats.totalEpisodes, pending: stats.pendingEpisodes }
  ];

  const approvalData = [
    { name: 'Approved', value: stats.totalEpisodes - stats.pendingEpisodes, color: '#10b981' },
    { name: 'Pending', value: stats.pendingEpisodes, color: '#f59e0b' }
  ];

  const growthData = [
    { month: 'Jan', users: 120, episodes: 45 },
    { month: 'Feb', users: 180, episodes: 67 },
    { month: 'Mar', users: 250, episodes: 89 },
    { month: 'Apr', users: 320, episodes: 112 },
    { month: 'May', users: 420, episodes: 145 },
    { month: 'Jun', users: stats.totalUsers, episodes: stats.totalEpisodes }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of platform statistics and content management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard 
          label="Total Users" 
          value={stats.totalUsers} 
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard 
          label="Creators" 
          value={stats.totalCreators} 
          icon={Briefcase}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard 
          label="Admins" 
          value={stats.totalAdmins} 
          icon={Shield}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard 
          label="Podcasts" 
          value={stats.totalPodcasts} 
          icon={Podcast}
          color="text-pink-600"
          bgColor="bg-pink-100"
        />
        <StatCard 
          label="Episodes" 
          value={stats.totalEpisodes} 
          icon={Music}
          color="text-indigo-600"
          bgColor="bg-indigo-100"
        />
        <StatCard 
          label="Pending" 
          value={stats.pendingEpisodes} 
          icon={Clock}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">User Distribution</h3>
              <p className="text-xs text-gray-500">By role type</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Content Overview Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Content Overview</h3>
              <p className="text-xs text-gray-500">Total vs pending</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="total" fill="#8b5cf6" name="Total" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Episode Approval Status</h3>
              <p className="text-xs text-gray-500">Current state</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={approvalData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {approvalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Engagement Rate */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Platform Health</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Content Approval</span>
                <span className="text-sm font-bold text-gray-900">
                  {((1 - stats.pendingEpisodes / stats.totalEpisodes) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${((1 - stats.pendingEpisodes / stats.totalEpisodes) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Creator Ratio</span>
                <span className="text-sm font-bold text-gray-900">
                  {((stats.totalCreators / stats.totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(stats.totalCreators / stats.totalUsers) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Needed */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Actions Needed</h3>
          </div>
          <div className="space-y-2">
            {stats.pendingEpisodes > 0 && (
              <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-900">
                  {stats.pendingEpisodes} episodes pending review
                </p>
                <p className="text-xs text-gray-600">Review and approve content</p>
              </div>
            )}
            {stats.pendingEpisodes === 0 && (
              <div className="bg-white/60 backdrop-blur rounded-lg p-3">
                <p className="text-sm font-semibold text-green-700">✓ All caught up!</p>
                <p className="text-xs text-gray-600">No pending actions</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Platform Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Episodes/Podcast</span>
              <span className="text-lg font-bold text-gray-900">
                {(stats.totalEpisodes / stats.totalPodcasts || 0).toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Content Growth</span>
              <span className="text-lg font-bold text-green-600">+24%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Growth</span>
              <span className="text-lg font-bold text-green-600">+18%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
