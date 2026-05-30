import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:7007/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...(options.body && { body: JSON.stringify(options.body) })
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }
  
  return response.json();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await apiCall('/users/me');
          if (response.success) {
            setToken(savedToken);
            setUser(response.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await apiCall('/users/login', {
        method: 'POST',
        body: { email, password }
      });
      
      if (response.success) {
        const { token, user } = response;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        
        toast.success(`Welcome back, ${user.name}!`);
        
        // Role-based redirect
        const rolePath = user.role.toLowerCase();
        navigate(`/${rolePath === 'admin' ? 'admin' : rolePath}/dashboard`, { replace: true });
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  }, [navigate]);

  const register = useCallback(async (userData) => {
    try {
      const response = await apiCall('/users/register', {
        method: 'POST',
        body: userData
      });
      
      if (response.success) {
        // NO TOKEN - Just show success and navigate to login
        toast.success('Account created! Please login.');
        navigate('/login', { replace: true });
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login', { replace: true });
  }, [navigate]);

    // ================== ADMIN API HELPERS ==================

  // DASHBOARD
  const fetchAdminDashboard = useCallback(async () => {
    try {
      const res = await apiCall('/admin/dashboard');
      return res.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // USERS
  const fetchAdminUsers = useCallback(async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiCall(`/admin/users${query ? `?${query}` : ''}`);
      return res.users;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const blockUser = useCallback(async (userId) => {
    try {
      const res = await apiCall(`/admin/users/${userId}/block`, {
        method: 'PATCH'
      });
      toast.success('User blocked');
      return res.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const unblockUser = useCallback(async (userId) => {
    try {
      const res = await apiCall(`/admin/users/${userId}/unblock`, {
        method: 'PATCH'
      });
      toast.success('User unblocked');
      return res.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const updateUserRole = useCallback(async (userId, role) => {
    try {
      const res = await apiCall(`/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: { role }
      });
      toast.success('User role updated');
      return res.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const deleteUserByAdmin = useCallback(async (userId) => {
    try {
      const res = await apiCall(`/admin/users/${userId}`, {
        method: 'DELETE'
      });
      toast.success('User deleted');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // PODCASTS
  const fetchAdminPodcasts = useCallback(async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiCall(`/admin/podcasts${query ? `?${query}` : ''}`);
      return res.podcasts;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const approvePodcast = useCallback(async (podcastId) => {
    try {
      const res = await apiCall(`/admin/podcasts/${podcastId}/approve`, {
        method: 'PATCH'
      });
      toast.success('Podcast approved');
      return res.podcast;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const rejectPodcast = useCallback(async (podcastId, reason) => {
    try {
      const res = await apiCall(`/admin/podcasts/${podcastId}/reject`, {
        method: 'PATCH',
        body: { reason }
      });
      toast.success('Podcast rejected');
      return res.podcast;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const updatePodcastFeatured = useCallback(async (podcastId, payload) => {
    try {
      const res = await apiCall(`/admin/podcasts/${podcastId}/feature`, {
        method: 'PATCH',
        body: payload // { isFeatured, isTrending }
      });
      toast.success('Podcast updated');
      return res.podcast;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // EPISODES
  const fetchPendingEpisodes = useCallback(async () => {
    try {
      const res = await apiCall('/admin/episodes/pending');
      return res.episodes;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const approveEpisode = useCallback(async (episodeId) => {
    try {
      const res = await apiCall(`/admin/episodes/${episodeId}/approve`, {
        method: 'PATCH'
      });
      toast.success('Episode approved');
      return res.episode;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const rejectEpisode = useCallback(async (episodeId, reason) => {
    try {
      const res = await apiCall(`/admin/episodes/${episodeId}/reject`, {
        method: 'PATCH',
        body: { reason }
      });
      toast.success('Episode rejected');
      return res.episode;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // CATEGORIES
  const fetchCategories = useCallback(async () => {
    try {
      const res = await apiCall('/admin/categories');
      return res.categories;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const createCategory = useCallback(async (data) => {
    try {
      const res = await apiCall('/admin/categories', {
        method: 'POST',
        body: data
      });
      toast.success('Category created');
      return res.category;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const updateCategory = useCallback(async (id, data) => {
    try {
      const res = await apiCall(`/admin/categories/${id}`, {
        method: 'PATCH',
        body: data
      });
      toast.success('Category updated');
      return res.category;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const toggleCategoryActive = useCallback(async (id, isActive) => {
    try {
      const res = await apiCall(`/admin/categories/${id}/toggle`, {
        method: 'PATCH',
        body: { isActive }
      });
      toast.success('Category status updated');
      return res.category;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    try {
      const res = await apiCall(`/admin/categories/${id}`, {
        method: 'DELETE'
      });
      toast.success('Category deleted');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

    // ================== CREATOR API HELPERS ==================

  // CREATOR DASHBOARD
  const fetchCreatorDashboard = useCallback(async () => {
    try {
      const res = await apiCall('/creator/dashboard');
      return res.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // CREATOR PROFILE
  const fetchCreatorProfile = useCallback(async () => {
    try {
      const res = await apiCall('/creator/profile');
      return res.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const updateCreatorProfile = useCallback(async (data) => {
    try {
      const res = await apiCall('/creator/profile', {
        method: 'PATCH',
        body: data
      });
      toast.success('Profile updated');
      return res.user;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // CREATOR PODCASTS
  const fetchCreatorPodcasts = useCallback(async () => {
    try {
      const res = await apiCall('/creator/podcasts');
      return res.podcasts;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const fetchCreatorPodcastById = useCallback(async (id) => {
    try {
      const res = await apiCall(`/creator/podcasts/${id}`);
      return res.podcast;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const deletePodcast = useCallback(async (id) => {
    try {
      const res = await apiCall(`/creator/podcasts/${id}`, {
        method: 'DELETE'
      });
      toast.success('Podcast deleted');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const publishPodcast = useCallback(async (id) => {
    try {
      const res = await apiCall(`/creator/podcasts/${id}/publish`, {
        method: 'PATCH'
      });
      toast.success('Podcast submitted for approval');
      return res.podcast;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // CREATOR EPISODES
  const fetchCreatorEpisodes = useCallback(async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiCall(`/creator/episodes${query ? `?${query}` : ''}`);
      return res.episodes;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const fetchCreatorEpisodeById = useCallback(async (id) => {
    try {
      const res = await apiCall(`/creator/episodes/${id}`);
      return res.episode;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // ================== CREATOR API HELPERS - FILE UPLOAD SUPPORT ==================

// CREATOR PODCASTS - ✅ UPDATED FOR FILE UPLOAD
const createPodcast = useCallback(async (data) => {
  try {
    const token = localStorage.getItem('token');
    
    // ✅ Handle both FormData and regular JSON
    const config = {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: data instanceof FormData ? data : JSON.stringify(data)
    };
    
    // Only set Content-Type for JSON, not FormData
    if (!(data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE}/creator/podcasts`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Something went wrong');
    }
    
    const res = await response.json();
    toast.success('Podcast created');
    return res.podcast;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
}, []);

const updatePodcast = useCallback(async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    
    // ✅ Handle both FormData and regular JSON
    const config = {
      method: 'PATCH',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: data instanceof FormData ? data : JSON.stringify(data)
    };
    
    // Only set Content-Type for JSON, not FormData
    if (!(data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE}/creator/podcasts/${id}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Something went wrong');
    }
    
    const res = await response.json();
    toast.success('Podcast updated');
    return res.podcast;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
}, []);

// CREATOR EPISODES - ✅ UPDATED FOR FILE UPLOAD
const createEpisode = useCallback(async (data) => {
  try {
    const token = localStorage.getItem('token');
    
    // ✅ Handle both FormData and regular JSON
    const config = {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: data instanceof FormData ? data : JSON.stringify(data)
    };
    
    // Only set Content-Type for JSON, not FormData
    if (!(data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE}/creator/episodes`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Something went wrong');
    }
    
    const res = await response.json();
    toast.success('Episode created');
    return res.episode;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
}, []);

const updateEpisode = useCallback(async (id, data) => {
  try {
    const token = localStorage.getItem('token');
    
    // ✅ Handle both FormData and regular JSON
    const config = {
      method: 'PATCH',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: data instanceof FormData ? data : JSON.stringify(data)
    };
    
    // Only set Content-Type for JSON, not FormData
    if (!(data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE}/creator/episodes/${id}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Something went wrong');
    }
    
    const res = await response.json();
    toast.success('Episode updated');
    return res.episode;
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
}, []);

  const deleteEpisode = useCallback(async (id) => {
    try {
      const res = await apiCall(`/creator/episodes/${id}`, {
        method: 'DELETE'
      });
      toast.success('Episode deleted');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const publishEpisode = useCallback(async (id) => {
    try {
      const res = await apiCall(`/creator/episodes/${id}/publish`, {
        method: 'PATCH'
      });
      toast.success('Episode submitted for approval');
      return res.episode;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // CREATOR ANALYTICS
  const fetchCreatorAnalytics = useCallback(async () => {
    try {
      const res = await apiCall('/creator/analytics');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // ================== LISTENER API HELPERS ==================

  // LISTENER HOME & BROWSE
  const fetchListenerHome = useCallback(async () => {
    try {
      const res = await apiCall('/listener/home');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const fetchAllPodcasts = useCallback(async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiCall(`/listener/podcasts${query ? `?${query}` : ''}`);
      return res.podcasts;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const fetchPodcastDetail = useCallback(async (id) => {
    try {
      const res = await apiCall(`/listener/podcasts/${id}`);
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const fetchEpisodeDetail = useCallback(async (id) => {
    try {
      const res = await apiCall(`/listener/episodes/${id}`);
      return res.episode;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const fetchListenerCategories = useCallback(async () => {
    try {
      const res = await apiCall('/listener/categories');
      return res.categories;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // LISTENER SUBSCRIPTIONS
  const subscribeToPodcast = useCallback(async (podcastId) => {
    try {
      const res = await apiCall('/listener/subscriptions', {
        method: 'POST',
        body: { podcastId }
      });
      toast.success('Subscribed');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const unsubscribeFromPodcast = useCallback(async (podcastId) => {
    try {
      const res = await apiCall(`/listener/subscriptions/${podcastId}`, {
        method: 'DELETE'
      });
      toast.success('Unsubscribed');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const res = await apiCall('/listener/subscriptions');
      return res.subscriptions;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // LISTENER LIKES
  const likeEpisode = useCallback(async (episodeId) => {
    try {
      const res = await apiCall('/listener/likes', {
        method: 'POST',
        body: { episodeId }
      });
      toast.success('Liked');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const unlikeEpisode = useCallback(async (episodeId) => {
    try {
      const res = await apiCall(`/listener/likes/${episodeId}`, {
        method: 'DELETE'
      });
      toast.success('Unliked');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // LISTENER COMMENTS
  const addComment = useCallback(async (episodeId, text) => {
    try {
      const res = await apiCall('/listener/comments', {
        method: 'POST',
        body: { episodeId, text }
      });
      toast.success('Comment added');
      return res.comment;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const fetchEpisodeComments = useCallback(async (episodeId) => {
    try {
      const res = await apiCall(`/listener/episodes/${episodeId}/comments`);
      return res.comments;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // LISTENER PLAYLISTS
  const fetchPlaylists = useCallback(async () => {
    try {
      const res = await apiCall('/listener/playlists');
      return res.playlists;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const createPlaylist = useCallback(async (data) => {
    try {
      const res = await apiCall('/listener/playlists', {
        method: 'POST',
        body: data
      });
      toast.success('Playlist created');
      return res.playlist;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const addToPlaylist = useCallback(async (playlistId, episodeId) => {
    try {
      const res = await apiCall(`/listener/playlists/${playlistId}/add`, {
        method: 'PATCH',
        body: { episodeId }
      });
      toast.success('Added to playlist');
      return res.playlist;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const removeFromPlaylist = useCallback(async (playlistId, episodeId) => {
    try {
      const res = await apiCall(`/listener/playlists/${playlistId}/remove`, {
        method: 'PATCH',
        body: { episodeId }
      });
      toast.success('Removed from playlist');
      return res.playlist;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const deletePlaylist = useCallback(async (playlistId) => {
    try {
      const res = await apiCall(`/listener/playlists/${playlistId}`, {
        method: 'DELETE'
      });
      toast.success('Playlist deleted');
      return res;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  // LISTENER HISTORY
  const updateHistory = useCallback(async (episodeId, lastPosition, completed) => {
    try {
      const res = await apiCall('/listener/history', {
        method: 'POST',
        body: { episodeId, lastPosition, completed }
      });
      return res.history;
    } catch (error) {
      // Silent fail for history updates
      console.error('History update failed:', error);
      throw error;
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiCall('/listener/history');
      return res.history || [];
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  }, []);

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,

    // ADMIN METHODS
    fetchAdminDashboard,
    fetchAdminUsers,
    blockUser,
    unblockUser,
    updateUserRole,
    deleteUserByAdmin,

    fetchAdminPodcasts,
    approvePodcast,
    rejectPodcast,
    updatePodcastFeatured,

    fetchPendingEpisodes,
    approveEpisode,
    rejectEpisode,

    fetchCategories,
    createCategory,
    updateCategory,
    toggleCategoryActive,
    deleteCategory,

    // ADMIN METHODS
    fetchAdminDashboard,
    fetchAdminUsers,
    blockUser,
    unblockUser,
    updateUserRole,
    deleteUserByAdmin,
    fetchAdminPodcasts,
    approvePodcast,
    rejectPodcast,
    updatePodcastFeatured,
    fetchPendingEpisodes,
    approveEpisode,
    rejectEpisode,
    fetchCategories,
    createCategory,
    updateCategory,
    toggleCategoryActive,
    deleteCategory,

    // CREATOR METHODS
    fetchCreatorDashboard,
    fetchCreatorProfile,
    updateCreatorProfile,
    fetchCreatorPodcasts,
    fetchCreatorPodcastById,
    createPodcast,
    updatePodcast,
    deletePodcast,
    publishPodcast,
    fetchCreatorEpisodes,
    fetchCreatorEpisodeById,
    createEpisode,
    updateEpisode,
    deleteEpisode,
    publishEpisode,
    fetchCreatorAnalytics,

    // LISTENER METHODS
    fetchListenerHome,
    fetchAllPodcasts,
    fetchPodcastDetail,
    fetchEpisodeDetail,
    fetchListenerCategories,
    subscribeToPodcast,
    unsubscribeFromPodcast,
    fetchSubscriptions,
    likeEpisode,
    unlikeEpisode,
    addComment,
    fetchEpisodeComments,
    fetchPlaylists,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    updateHistory,
    fetchHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
