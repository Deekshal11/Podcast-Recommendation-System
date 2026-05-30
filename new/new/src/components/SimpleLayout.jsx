import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Home, 
  Search, 
  Heart, 
  Clock, 
  List,
  User,
  LogOut,
  Menu,
  X,
  Mic,
  BarChart3,
  Headphones,
  Radio,
  History as HistoryIcon,
  Library,
  Settings,
  ChevronDown
} from 'lucide-react';

const SimpleLayout = ({ role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isCreator = role === 'Creator';

  // Navigation items based on role
  const navItems = isCreator ? [
    { path: '/creator/dashboard', label: 'Dashboard', icon: Home },
    { path: '/creator/podcasts', label: 'My Podcasts', icon: Mic },
    { path: '/creator/episodes', label: 'Episodes', icon: Radio },
    { path: '/creator/analytics', label: 'Analytics', icon: BarChart3 },
  ] : [
    { path: '/listener/dashboard', label: 'Home', icon: Home },
    { path: '/listener/browse', label: 'Browse', icon: Search },
    { path: '/listener/subscriptions', label: 'Subscriptions', icon: Heart },
    { path: '/listener/playlists', label: 'Playlists', icon: Library },
    { path: '/listener/history', label: 'History', icon: HistoryIcon },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-8">
              <Link to={isCreator ? '/creator/dashboard' : '/listener/dashboard'} className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  {isCreator ? (
                    <Mic className="w-5 h-5 text-white" />
                  ) : (
                    <Headphones className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  {isCreator ? 'Creator Studio' : 'Podcast Player'}
                </span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        active
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Role Badge */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isCreator ? 'bg-purple-500' : 'bg-green-500'}`} />
                <span className="text-xs font-semibold text-gray-700">
                  {isCreator ? 'Creator' : 'Listener'}
                </span>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">Account</p>
                        <p className="text-xs text-gray-500 mt-1">{isCreator ? 'Creator Mode' : 'Listener Mode'}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                        active
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                {isCreator ? (
                  <Mic className="w-4 h-4 text-white" />
                ) : (
                  <Headphones className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                Podcast Platform
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link to="/about" className="hover:text-gray-900 transition">About</Link>
              <Link to="/help" className="hover:text-gray-900 transition">Help</Link>
              <Link to="/privacy" className="hover:text-gray-900 transition">Privacy</Link>
              <Link to="/terms" className="hover:text-gray-900 transition">Terms</Link>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 Podcast Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLayout;
