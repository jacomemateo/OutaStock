import '../styles/Template.css'
import logo from '../assets/transparent-gold-logo.png'
import DashboardIcon from '@mui/icons-material/Dashboard';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import SettingsIcon from '@mui/icons-material/Settings';

// Page Components
import UpdateProducts from './UpdateProducts'
import Analytics from './Analytics'
import Alerts from './Alerts'
import Settings from './Settings'
import DashBoard from './Dashboard'

import '../styles/Template.css'
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom'

const Template = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const pages = [
        { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, component: <DashBoard />, path: "" },
        { id: "update-products", label: "Update Products", icon: <SystemUpdateIcon />, component: <UpdateProducts />, path: "update-products" },
        { id: "analytics", label: "Analytics", icon: <TrendingUpIcon />, component: <Analytics />, path: "analytics" },
        { id: "alerts", label: "Alerts", icon: <AddAlertIcon />, component: <Alerts />, path: "alerts" },
        { id: "settings", label: "Settings", icon: <SettingsIcon />, component: <Settings />, path: "settings" },
    ]

    // Determine current ID based on the URL path
    // We remove "/dashboard/" from the location.pathname to match our IDs
    const currentId = location.pathname.split("/").pop() || "dashboard";
    
    // FIX for the 'undefined' error: Provide a fallback object
    const activePage = pages.find(p => p.id === currentId) || pages[0];

    return (
        <div className="template-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Company Logo"/>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {pages.map((page) => (
                            <li key={page.id} className={currentId === page.id ? "active" : ""}>
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
            </aside>

            <main className="main-content">
                <header className="template-header">
                    <h1>{activePage.label}</h1>
                </header>
                <div className="content">
                    {/* The Routes block now decides what to show based on the URL */}
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
    )
}

export default Template