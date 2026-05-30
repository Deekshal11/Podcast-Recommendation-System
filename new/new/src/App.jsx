import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import AdminLayout from './components/AdminLayout';
import SimpleLayout from './components/SimpleLayout';
import ProtectedRoute from './pages/ProtectedRoute';
import { AuthProvider } from './context/Context';
import AdminDashboard from './pages/Admin/Dashboard';
import Users from './pages/Admin/Users';
import AdminCategories from './pages/Admin/Categories';
import AdminEpisodesPending from './pages/Admin/Episodes';
import CreatorDashboard from './pages/Creator/Dashboard';
import MyPodcasts from './pages/Creator/MyPodcasts';
import PodcastForm from './pages/Creator/PodcastForm';
import MyEpisodes from './pages/Creator/Episodes';
import EpisodeForm from './pages/Creator/EpisodeForm';
import CreatorAnalytics from './pages/Creator/Analytics';
import ListenerHome from './pages/Listener/Home';
import BrowsePodcasts from './pages/Listener/BrowseAllPodcasts';
import PodcastDetail from './pages/Listener/PodcastDetails';
import EpisodePlayer from './pages/Listener/EpisodePlayer';
import Subscriptions from './pages/Listener/Subscriptions';
import Playlists from './pages/Listener/Playlists';
import History from './pages/Listener/History';
import PlaylistDetail from './pages/Listener/PlaylistManage';
import AllEpisodes from './pages/Admin/AllEpisodes';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="approvals" element={<AdminEpisodesPending />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="episodes" element={<AllEpisodes />} /> {/* ✅ ADD THIS */}
            </Route>

            {/* Creator Routes - Protected */}
            <Route path="/creator/*" element={
              <ProtectedRoute allowedRoles={['CREATOR', 'ADMIN']}>
                <SimpleLayout role="Creator" />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<CreatorDashboard />} />
              <Route path="podcasts" element={<MyPodcasts />} />
              <Route path="podcasts/new" element={<PodcastForm />} />
              <Route path="episodes" element={<MyEpisodes />} />
              <Route path="episodes/new" element={<EpisodeForm />} />
              <Route path="analytics" element={<CreatorAnalytics />} />
              <Route path="podcasts/:id/edit" element={<PodcastForm />} /> {/* ✅ ADDED */}
              <Route path="episodes/:id/edit" element={<EpisodeForm />} /> {/* ✅ ADDED */}
            </Route>

            {/* Listener Routes - Protected */}
            <Route path="/listener/*" element={
              <ProtectedRoute allowedRoles={['LISTENER', 'CREATOR', 'ADMIN']}>
                <SimpleLayout role="Listener" />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<ListenerHome />} />
              <Route path="browse" element={<BrowsePodcasts />} />
              <Route path="podcasts/:id" element={<PodcastDetail />} />
              <Route path="episodes/:id" element={<EpisodePlayer />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="playlists" element={<Playlists />} />
              <Route path="history" element={<History />} />
              <Route path="playlists/:id" element={<PlaylistDetail />} />
            </Route>

            {/* Home Route */}
            <Route path="/" element={<LandingPage />} />


            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
