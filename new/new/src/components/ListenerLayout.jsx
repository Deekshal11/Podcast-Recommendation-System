import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const ListenerLayout = () => {
  const sidebarItems = [
    { path: '/listener/home', label: 'Home', icon: '🏠' },
    { path: '/listener/podcasts', label: 'Podcasts', icon: '🎙️' },
    { path: '/listener/history', label: 'History', icon: '⏳' },
    { path: '/listener/playlists', label: 'Playlists', icon: '📝' },
    { path: '/listener/subscriptions', label: 'Subscriptions', icon: '⭐' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar role="Listener" />
      <div className="flex">
        <Sidebar role="listener" sidebarItems={sidebarItems} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ListenerLayout;
