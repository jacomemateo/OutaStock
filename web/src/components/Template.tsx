import '@styles/Template.css';
import logo from '@assets/transparent-gold-logo.png';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PersonIcon from '@mui/icons-material/Person';

// Page Components
import UpdateProducts from '@components/UpdateProducts';
import Analytics from '@components/Analytics';
import Alerts from '@components/Alerts';
import Settings from '@components/Settings';
import DashBoard from '@components/Dashboard';
import ViewAllTransactions from '@components/ViewAllTransactions';

import '@styles/Template.css';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const Template = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signOut, user } = useAuth();

    const pages = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <DashboardIcon />,
            component: <DashBoard />,
            path: '',
        },
        {
            id: 'update-products',
            label: 'Update Products',
            icon: <SystemUpdateIcon />,
            component: <UpdateProducts />,
            path: 'update-products',
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: <TrendingUpIcon />,
            component: <Analytics />,
            path: 'analytics',
        },
        {
            id: 'view-all-transactions',
            label: 'View All Transactions',
            icon: <ReceiptLongIcon />,
            component: <ViewAllTransactions />,
            path: 'view-all-transactions',
        },
        {
            id: 'alerts',
            label: 'Alerts',
            icon: <AddAlertIcon />,
            component: <Alerts />,
            path: 'alerts',
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: <SettingsIcon />,
            component: <Settings />,
            path: 'settings',
        },
    ];

    // Determine current ID based on the URL path
    // We remove "/dashboard/" from the location.pathname to match our IDs
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const currentId = pathSegments[1] || 'dashboard';

    // FIX for the 'undefined' error: Provide a fallback object
    const activePage = pages.find((p) => p.id === currentId) || pages[0];

    return (
        <div className="template-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Company Logo" />
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {pages.map((page) => (
                            <li
                                key={page.id}
                                className={currentId === page.id ? 'active' : ''} // If current url matches page id, add 'active' class for styling
                            >
                                <button
                                    className="nav-link-btn"
                                    onClick={() => navigate(`/dashboard/${page.path}`)}
                                >
                                    {page.icon} {page.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="template-user-section">
    <div
        className="template-user-chip clickable"
        onClick={() => navigate('/dashboard/settings/profile')}
    >
        <span className="template-user-name">
            {user?.name ?? 'Authenticated User'}
        </span>
        <span className="template-user-email">
            {user?.email ?? user?.preferred_username ?? 'No email'}
        </span>
    </div>
</div>
            </aside>

            <main className="main-content">
                <header className="template-header">
                    <div className="template-header-content">
                        <div>
                            <h1>{activePage.label}</h1>
                        </div>
                    </div>
                </header>
                <div className="content">
                    {/* The Routes block now decides what to show based on the URL */}
                    <Routes>
                        {pages.map((page) => (
                            <Route
                                key={page.id}
                                path={page.path === '' ? '/' : page.path + '/*'} // Add /* for nested routes
                                element={page.component}
                            />
                        ))}
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default Template;
