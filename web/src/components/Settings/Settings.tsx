import '@styles/Settings/Settings.css';
import { Fragment, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import TuneIcon from '@mui/icons-material/Tune';

import Apperance from '@/components/Settings/Apperance';
import AdminRoute from '@/components/LoadingScreen/AdminRoute';
import Profile from '@/components/Settings/Profile';
import Team from '@/components/Settings/Team';
import Thresholds from '@/components/Settings/Thresholds';
import { useAuth } from '@contexts/AuthContext';

const Settings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdmin } = useAuth();

    const pages = [
        {
            id: 'profile',
            label: 'Profile',
            section: 'Account',
            icon: <PersonIcon />,
            component: <Profile />,
            path: 'profile',
            adminOnly: false,
        },
        {
            id: 'team',
            label: 'Team',
            section: 'Account',
            icon: <GroupsIcon />,
            component: (
                <AdminRoute>
                    <Team />
                </AdminRoute>
            ),
            path: 'team',
            adminOnly: true,
        },
        {
            id: 'appearance',
            label: 'Appearance',
            section: 'Preferences',
            icon: <BedtimeIcon />,
            component: <Apperance />,
            path: 'appearance',
            adminOnly: false,
        },
        {
            id: 'thresholds',
            label: 'Thresholds',
            section: 'Administration',
            icon: <TuneIcon />,
            component: (
                <AdminRoute>
                    <Thresholds />
                </AdminRoute>
            ),
            path: 'thresholds',
            adminOnly: true,
        },
    ];

    const visiblePages = pages.filter((page) => !page.adminOnly || isAdmin);
    const currentId = location.pathname.split('/').pop() || 'profile';
    const activePage = pages.find((p) => p.id === currentId) || pages[0];

    useEffect(() => {
        if (
            location.pathname === '/dashboard/settings' ||
            location.pathname.endsWith('/settings')
        ) {
            navigate('/dashboard/settings/profile', { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <div className="grid-container">
            <div className="settings-grid">
                <div className="page-card settings-card">
                    <div className="settings-container">
                        <aside className="settings-sidebar">
                            <nav className="settings-nav">
                                <ul>
                                    {visiblePages.map((page, idx) => (
                                        <Fragment key={page.id}>
                                            {idx === 0 ||
                                            visiblePages[idx - 1].section !==
                                                page.section ? (
                                                <li className="settings-section-heading">
                                                    {page.section}
                                                </li>
                                            ) : null}

                                            <li
                                                className={
                                                    currentId === page.id ? 'active' : ''
                                                }
                                            >
                                                <button
                                                    className="tab-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/dashboard/settings/${page.path}`,
                                                        )
                                                    }
                                                >
                                                    {page.icon} {page.label}
                                                </button>
                                            </li>
                                        </Fragment>
                                    ))}
                                </ul>
                            </nav>
                        </aside>

                        <main className="settings-main">
                            <header className="settings-heading-section">
                                <h1 className="settings-heading">{activePage.label}</h1>
                            </header>

                            <div className="settings-content">
                                <Routes>
                                    {pages.map((page) => (
                                        <Route
                                            key={page.id}
                                            path={page.path}
                                            element={page.component}
                                        />
                                    ))}
                                </Routes>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
