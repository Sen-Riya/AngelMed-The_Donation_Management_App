import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

function Sidebar({ isCollapsed = false, setIsCollapsed }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => {
    const baseClass = `flex items-center ${
      isCollapsed ? 'justify-center' : ''
    } px-3 py-3 text-gray-600 rounded-lg mb-1 transition-all`;

    return isActive(path)
      ? `${baseClass} bg-gray-100 text-gray-900 font-medium`
      : `${baseClass} hover:bg-gray-50 hover:text-gray-900`;
  };

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-56'} bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div
        className={`h-14 flex items-center px-3 border-b border-gray-200 transition-all ${
          isCollapsed ? 'justify-end' : 'justify-between'
        }`}
      >
        {!isCollapsed && (
          <div className="flex items-center space-x-3 pl-1">
            <img
              src="/AngelMed_Logo.png"
              alt="AngelMed"
              className="max-w-[120px] h-auto object-contain"
            />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed && setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-10 h-10 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
        {/* Dashboard */}
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          {!isCollapsed && <span className="text-sm">Dashboard</span>}
          <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Link>

        {/* Life Members */}
        <Link to="/life-members" className={linkClass('/life-members')}>
          {!isCollapsed && <span className="text-sm">Life Members</span>}
          <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </Link>

        {/* Donations */}
        <Link to="/donations" className={linkClass('/donations')}>
          {!isCollapsed && <span className="text-sm">Donations</span>}
          <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </Link>

        {/* Medical Donations */}
        <Link to="/medical-donation" className={linkClass('/medical-donation')}>
          {!isCollapsed && <span className="text-sm">Med Donations</span>}
<svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    d="M12 8v8m-4-4h8"
  />
</svg>
        </Link>

        {/* Clients */}
        <Link to="/clients" className={linkClass('/clients')}>
          {!isCollapsed && <span className="text-sm">Clients</span>}
          <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </Link>

        {/* Distribution */}
        <Link to="/distribution" className={linkClass('/distribution')}>
          {!isCollapsed && <span className="text-sm">Distribution</span>}
          <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </Link>

        {/* Analytics */}
        <Link to="/analytics" className={linkClass('/analytics')}>
          {!isCollapsed && <span className="text-sm">Analytics</span>}
          <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </Link>
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-end' : ''
          } px-3 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all`}
        >
          {!isCollapsed && <span className="ml-3 text-sm">Logout</span>}
          <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;