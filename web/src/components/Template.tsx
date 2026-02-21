import '../styles/Template.css'
import { useState } from 'react'
import logo from '../assets/transparent-gold-logo.png'
import DashboardIcon from '@mui/icons-material/Dashboard';
import SystemUpdateIcon from '@mui/icons-material/SystemUpdate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import SettingsIcon from '@mui/icons-material/Settings';
import UpdateProducts from './UpdateProducts'
import Analytics from './Analytics'
import Alerts from './Alerts'
import Settings from './Settings'
import DashBoard from './Dashboard'

const Template = () => {
    const [currentPage, setCurrentPage] = useState("dashboard")
    return (
        <div className="template-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Company Logo"/>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><a href="#dashboard" onClick={() => setCurrentPage("dashboard")}><DashboardIcon />Dashboard</a></li>
                        <li><a href="#update-products" onClick={() => setCurrentPage("update-products")}><SystemUpdateIcon />Update Products</a></li>
                        <li><a href="#analytics" onClick={() => setCurrentPage("analytics")}><TrendingUpIcon />Analytics</a></li>
                        <li><a href="#alerts" onClick={() => setCurrentPage("alerts")}><AddAlertIcon />Alerts</a></li>
                        <li><a href="#settings" onClick={() => setCurrentPage("settings")}><SettingsIcon />Settings</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header className="template-header">
                    {currentPage === "dashboard" && <h1>Dashboard</h1>}
                    {currentPage === "update-products" && <h1>Update Products</h1>}
                    {currentPage === "analytics" && <h1>Analytics</h1>}
                    {currentPage === "alerts" && <h1>Alerts</h1>}
                    {currentPage === "settings" && <h1>Settings</h1>}
                </header>
                <div className="content">
                    {currentPage === "dashboard" && <DashBoard />}
                    {currentPage === "update-products" && <UpdateProducts />}
                    {currentPage === "analytics" && <Analytics />}
                    {currentPage === "alerts" && <Alerts />}
                    {currentPage === "settings" && <Settings />}
                </div>
            </main>
        </div>
    )
}

export default Template