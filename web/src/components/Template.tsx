import '@styles/Template.css';
import logoDark from '@assets/logo-white.png';
import logoLight from '@assets/logo-black.png';
import smallLogo from '@assets/tab-logo.png';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

// Page Components
import UpdateProducts from '@components/UpdateProducts/UpdateProducts';
import Analytics from '@/components/Analytics/Analytics';
import Alerts from '@/components/Alerts/Alerts';
import Settings from '@/components/Settings/Settings';
import DashBoard from '@/components/Home/Home';
import ViewAllTransactions from '@/components/Transactions/ViewAllTransactions';

import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const Template = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const userLabel = user?.email ?? 'Authenticated User';
    const userName = user?.email?.split('@')[0] ?? 'Authenticated User';
    const userInitial = user?.email?.charAt(0).toUpperCase() ?? 'U';

    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    type NavPosition = 'top' | 'bottom';

    const pages = [
        {
            id: 'dashboard',
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

    const [isDragging, setIsDragging] = useState(false);
    const handleUpload = (files: FileList) => {
        // wire to your file_upload_service here
        console.log('Uploading:', files);
    };

    return (
        <div className="template-container">
            <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <button
                        className="logo-button"
                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        aria-label="Toggle sidebar"
                    >
                        <div className="logo-wrapper">
                            {isSidebarExpanded ? (
                                <>
                                    <img
                                        className="logo logo-dark"
                                        src={logoDark}
                                        alt="Company Logo"
                                    />
                                    <img
                                        className="logo logo-light"
                                        src={logoLight}
                                        alt="Company Logo"
                                    />
                                </>
                            ) : (
                                <img
                                    className="logo logo-small"
                                    src={smallLogo}
                                    alt="Company Logo"
                                />
                            )}
                        </div>
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <ul className="sidebar-nav-list sidebar-nav-list-top">
                        {topPages.map((page) => (
                            <li
                                key={page.id}
                                className={currentId === page.id ? 'active' : ''} // If current url matches page id, add 'active' class for styling
                                data-tooltip-id="nav-tooltip"
                                data-tooltip-content={
                                    !isSidebarExpanded ? page.label : ''
                                }
                                data-tooltip-place="right"
                            >
                                <button
                                    className="nav-link-btn"
                                    onClick={() => navigate(`/dashboard/${page.path}`)}
                                >
                                    {page.icon}{' '}
                                    {isSidebarExpanded && <span>{page.label}</span>}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* upload file */}
                    {/* Between the two ul blocks, inside <nav className="sidebar-nav"> */}

                    <div
                        className={`sidebar-upload-zone ${isDragging ? 'dragging' : ''} ${!isSidebarExpanded ? 'collapsed' : ''}`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            const files = e.dataTransfer.files;
                            if (files.length > 0) handleUpload(files);
                        }}
                        onClick={() =>
                            document.getElementById('sidebar-file-input')?.click()
                        }
                    >
                        <input
                            id="sidebar-file-input"
                            type="file"
                            hidden
                            onChange={(e) => {
                                if (e.target.files) handleUpload(e.target.files);
                            }}
                        />
                        {isSidebarExpanded ? (
                            <>
                                <UploadFileIcon className="upload-icon" />
                                <span className="upload-label">Drop files here</span>
                                <span className="upload-sub">or click to browse</span>
                            </>
                        ) : (
                            <UploadFileIcon className="upload-icon" />
                        )}
                    </div>

                    {bottomPages.length > 0 ? (
                        <ul className="sidebar-nav-list sidebar-nav-list-bottom">
                            {bottomPages.map((page) => (
                                <li
                                    key={page.id}
                                    className={currentId === page.id ? 'active' : ''}
                                    data-tooltip-id="nav-tooltip"
                                    data-tooltip-content={
                                        !isSidebarExpanded ? page.label : ''
                                    }
                                    data-tooltip-place="right"
                                >
                                    <button
                                        className="nav-link-btn"
                                        onClick={() =>
                                            navigate(`/dashboard/${page.path}`)
                                        }
                                    >
                                        {page.icon}{' '}
                                        {isSidebarExpanded && <span>{page.label}</span>}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </nav>
                <div
                    className="template-user-section clickable"
                    onClick={() => navigate('/dashboard/settings/profile')}
                >
                    {isSidebarExpanded && (
                        <>
                            <div className="user-icon">{userInitial}</div>
                            <div className="template-user-chip">
                                <span className="template-user-name">{userName}</span>
                                <span className="template-user-email">{userLabel}</span>
                            </div>
                        </>
                    )}
                    {!isSidebarExpanded && (
                        <div
                            className="user-icon"
                            data-tooltip-id="user-tooltip"
                            data-tooltip-content={userLabel}
                            data-tooltip-place="right"
                        >
                            {userInitial}
                        </div>
                    )}
                </div>
            </aside>

            <main className="main-content">
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
            </main>
            <Tooltip id="nav-tooltip" />
            <Tooltip id="user-tooltip" />
        </div>
    );
};

export default Template;
