import '@styles/Settings.css';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

import ThemeChoice from '@components/ThemeChoice';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import { useEffect } from 'react';

const Settings = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const pages = [
        {
            id: 'profile',
            label: 'Profile',
            section: 'Account',
            icon: <AccountCircleIcon />,
            component: <div>Profile</div>,
            path: 'profile',
        },

        {
            id: 'team',
            label: 'Team',
            section: 'Account', // Same section
            icon: <GroupsIcon />,
            component: <div>Team</div>,
            path: 'team',
        },

        {
            id: 'theme',
            label: 'Theme',
            section: 'Preferences',
            icon: <BedtimeIcon />,
            component: <ThemeChoice />,
            path: 'theme',
        },
    ];

    const currentId = location.pathname.split('/').pop() || 'profile';
    const activePage = pages.find((p) => p.id === currentId) || pages[0];
    // Determine which page is active based on the current URL

    useEffect(() => {
        if (
            location.pathname === '/dashboard/settings' ||
            location.pathname.endsWith('/settings')
        ) {
            navigate('/dashboard/settings/profile');
        }
    }, [location.pathname]);

    return (
        <div className="settings-container">
            <aside className="settings-sidebar">
                <nav className="settings-nav">
                    <ul>
                        {pages.map((page, idx) => (
                            <>
                                {/* Show section heading if it's the first item or section changed */}
                                {idx === 0 || pages[idx - 1].section !== page.section ? (
                                    <li className="settings-section-heading">
                                        {page.section}
                                    </li>
                                ) : null}

                                <li className={currentId === page.id ? 'active' : ''}>
                                    <button
                                        className="tab-btn"
                                        onClick={() =>
                                            navigate(`/dashboard/settings/${page.path}`)
                                        }
                                    >
                                        {page.icon} {page.label}
                                    </button>
                                </li>
                            </>
                        ))}
                    </ul>
                </nav>
            </aside>

            <div className="settings-content">
                <Routes>
                    {pages.map((page) => (
                        <Route key={page.id} path={page.path} element={page.component} />
                    ))}
                </Routes>
            </div>
        </div>
    );
};

export default Settings;
