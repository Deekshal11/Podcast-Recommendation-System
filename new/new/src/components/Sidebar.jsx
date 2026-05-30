// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FolderTree 
} from 'lucide-react';

const Sidebar = ({ role, sidebarItems }) => {
  const iconMap = {
    dashboard: <LayoutDashboard className="w-5 h-5" />,
    users: <Users className="w-5 h-5" />,
    approvals: <CheckSquare className="w-5 h-5" />,
    categories: <FolderTree className="w-5 h-5" />
  };

  return (
    <div className="w-64 bg-white/80 backdrop-blur-md shadow-xl border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 capitalize">
          {role} Dashboard
        </h2>
      </div>
      
      <nav className="mt-6 px-4 space-y-2">
        {sidebarItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            // REMOVED 'end' prop - let React Router handle matching
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
              }`
            }
          >
            <span className="mr-3">
              {iconMap[item.path.replace('/admin/', '')] || item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
