import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const CreatorLayout = () => {
  const sidebarItems = [
    { path: '/creator/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/creator/podcasts', label: 'My Podcasts', icon: '🎙️' },
    { path: '/creator/upload', label: 'Upload Episode', icon: '⬆️' },
    { path: '/creator/analytics', label: 'Analytics', icon: '📈' },
    { path: '/creator/settings', label: 'Profile', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar role="Creator" />
      <div className="flex">
        <Sidebar role="creator" sidebarItems={sidebarItems} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CreatorLayout;
