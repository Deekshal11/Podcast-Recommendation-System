// import { useAuth } from '../../context/AuthContext';

const Navbar = ({ role }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🎙️ Podcast Platform
            </h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user?.name} ({role})
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
