import { useEffect, useState } from 'react';
import { useAuth } from '../../context/Context';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Headphones, 
  Heart, 
  FileAudio, 
  Clock,
  Plus,
  BarChart3,
  Eye,
  MessageCircle,
  Download,
  Users,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, color, subtitle }) => (
  <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-lg">
            <ArrowUpRight className="w-3 h-3 text-green-600" />
            <span className="text-xs font-bold text-green-600">+{trend}%</span>
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value?.toLocaleString() || 0}</h3>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const QuickActionCard = ({ to, icon: Icon, title, description, color, gradient }) => (
  <Link
    to={to}
    className="group relative block p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-transparent hover:shadow-2xl transition-all duration-300 overflow-hidden"
  >
    <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    <div className="relative">
      <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-white transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors duration-300">
        {description}
      </p>
      <div className="mt-4 flex items-center text-blue-600 group-hover:text-white transition-colors duration-300">
        <span className="text-sm font-semibold">Get started</span>
        <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
      </div>
    </div>
  </Link>
);

const RecentActivityItem = ({ title, type, time, status }) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition">
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        type === 'episode' ? 'bg-blue-100' : 'bg-purple-100'
      }`}>
        {type === 'episode' ? (
          <Headphones className={`w-5 h-5 ${type === 'episode' ? 'text-blue-600' : 'text-purple-600'}`} />
        ) : (
          <FileAudio className="w-5 h-5 text-purple-600" />
        )}
      </div>
      <div>
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-xs text-gray-500">{time}</div>
      </div>
    </div>
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
      status === 'approved' ? 'bg-green-100 text-green-700' :
      status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
      'bg-gray-100 text-gray-700'
    }`}>
      {status === 'approved' && <CheckCircle className="w-3 h-3 inline mr-1" />}
      {status === 'pending' && <Clock className="w-3 h-3 inline mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  </div>
);

const CreatorDashboard = () => {
  const { fetchCreatorDashboard, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCreatorDashboard();
        setStats(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchCreatorDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48"></div>
        <div className="relative">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-blue-100 text-sm font-semibold uppercase tracking-wide">Creator Studio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}! 👋
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Your content is inspiring listeners worldwide. Let's keep the momentum going!
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileAudio}
          label="Total Podcasts"
          value={stats?.totalPodcasts}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle="Active series"
        />
        <StatCard
          icon={Headphones}
          label="Total Episodes"
          value={stats?.totalEpisodes}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          subtitle="Published content"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Plays"
          value={stats?.totalPlays}
          trend={12}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          subtitle="Last 30 days"
        />
        <StatCard
          icon={Heart}
          label="Total Likes"
          value={stats?.totalLikes}
          color="bg-gradient-to-br from-pink-500 to-pink-600"
          subtitle="Engagement score"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-10 h-10 text-gray-400" />
            <span className="text-2xl font-bold text-gray-900">{(stats?.totalPlays || 0)}</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Total Views</p>
        </div>

      </div>

      {/* Pending Alert */}
      {stats?.pendingEpisodes > 0 && (
        <div className="relative bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16"></div>
          <div className="relative flex items-start space-x-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {stats.pendingEpisodes} Episode{stats.pendingEpisodes > 1 ? 's' : ''} Awaiting Approval
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Your episodes are being reviewed by our team. This usually takes 24-48 hours.
              </p>
              <Link
                to="/creator/episodes"
                className="inline-flex items-center space-x-2 text-sm font-semibold text-amber-700 hover:text-amber-800 transition"
              >
                <span>View pending episodes</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            to="/creator/podcasts/new"
            icon={Plus}
            title="Create Podcast"
            description="Launch a new podcast series and reach more listeners"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <QuickActionCard
            to="/creator/episodes/new"
            icon={Headphones}
            title="Upload Episode"
            description="Add fresh content to keep your audience engaged"
            color="bg-gradient-to-br from-indigo-500 to-indigo-600"
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <QuickActionCard
            to="/creator/analytics"
            icon={BarChart3}
            title="View Analytics"
            description="Deep dive into your performance metrics"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>
      </div>
      
      {/* Growth Tips */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-8">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3">💡 Pro Tips to Grow Your Audience</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Publish consistently - weekly releases see 3x more subscriber growth</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Engage with listeners through comments to build a loyal community</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Add transcripts to make your content more discoverable and accessible</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Share episodes on social media for 50% more reach</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
