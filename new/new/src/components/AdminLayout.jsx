// src/components/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  const sidebarItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },      // ABSOLUTE PATH
    { path: '/admin/users', label: 'Users' },              // ABSOLUTE PATH
    { path: '/admin/approvals', label: 'Episode Approvals' }, // ABSOLUTE PATH
    { path: '/admin/categories', label: 'Categories' }     // ABSOLUTE PATH
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar role="Admin" sidebarItems={sidebarItems} />
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
