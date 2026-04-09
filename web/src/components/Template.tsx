import '@styles/Template.css';
import logo from '@assets/transparent-gold-logo.png';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home';

// Page Components
import UpdateProducts from '@components/UpdateProducts';
import Analytics from '@components/Analytics';
import Alerts from '@components/Alerts';
import Settings from '@components/Settings';
import DashBoard from '@components/Dashboard';
import ViewAllTransactions from '@components/ViewAllTransactions';

import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const Template = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    type NavPosition = 'top' | 'bottom';

    const pages = [
        {
            id: 'Home',
            label: 'Home',
            icon: <HomeIcon />,
            component: <DashBoard />,
            path: '',
            position: 'top' as NavPosition,
        },
        {
            id: 'update-products',
            label: 'Update Products',
            icon: <SystemUpdateIcon />,
            component: <UpdateProducts />,
            path: 'update-products',
            position: 'top' as NavPosition,
        },
        {
            id: 'transactions',
            label: 'Transactions',
            icon: <ReceiptLongIcon />,
            component: <ViewAllTransactions />,
            path: 'transactions',
            position: 'top' as NavPosition,
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: <TrendingUpIcon />,
            component: <Analytics />,
            path: 'analytics',
            position: 'top' as NavPosition,
        },
        {
            id: 'alerts',
            label: 'Alerts',
            icon: <AddAlertIcon />,
            component: <Alerts />,
            path: 'alerts',
            position: 'top' as NavPosition,
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: <SettingsIcon />,
            component: <Settings />,
            path: 'settings',
            position: 'bottom' as NavPosition,
        },
    ];

    const topPages = pages.filter((page) => page.position === 'top');
    const bottomPages = pages.filter((page) => page.position === 'bottom');

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const currentPath = pathSegments[1] ?? '';
    const activePage = pages.find((page) => page.path === currentPath) || pages[0];
    const currentId = activePage.id;

    return (
        <div className="template-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Company Logo" />
                </div>
                <nav className="sidebar-nav">
                    <ul className="sidebar-nav-list sidebar-nav-list-top">
                        {topPages.map((page) => (
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
                    {bottomPages.length > 0 ? (
                        <ul className="sidebar-nav-list sidebar-nav-list-bottom">
                            {bottomPages.map((page) => (
                                <li
                                    key={page.id}
                                    className={currentId === page.id ? 'active' : ''}
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
                    ) : null}
                </nav>
                <div className="template-user-section">
                    <div className="user-icon">{user?.name?.charAt(0)}</div>
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
