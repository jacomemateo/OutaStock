import '@styles/Settings.css';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

import ThemeChoice from '@components/ThemeChoice';

const Settings = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const pages = [
        {
            id: 'profile',
            label: 'Profile',
            section: 'Account',
            component: <ThemeChoice />,
            path: 'profile',
        },
        //ONLY HERE FOR TEST
        {
            id: 'security',
            label: 'Security',
            section: 'Account', // Same section
            component: <div>Security Settings</div>,
            path: 'security',
        },

        {
            id: 'theme',
            label: 'Theme',
            section: 'Preferences',
            component: <ThemeChoice />,
            path: 'theme',
        },
    ];

    const currentId = location.pathname.split('/').pop() || 'theme';
    const activePage = pages.find((p) => p.id === currentId) || pages[0];
    // Determine which page is active based on the current URL
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
                                        {page.label}
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
