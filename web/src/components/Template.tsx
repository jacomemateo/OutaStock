import '../styles/Dashboard.css'
import { useState } from 'react'
import logo from '../assets/transparent-gold-logo.png'
import UpdateProducts from './UpdateProducts'
import Analytics from './Analytics'
import Alerts from './Alerts'
import Settings from './Settings'
import DashBoard from './Dashboard'

const Template = () => {
    const [currentPage, setCurrentPage] = useState("dashboard")
    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Company Logo"/>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><a href="#dashboard" onClick={() => setCurrentPage("dashboard")}>Dashboard</a></li>
                        <li><a href="#update-products" onClick={() => setCurrentPage("update-products")}>Update Products</a></li>
                        <li><a href="#analytics" onClick={() => setCurrentPage("analytics")}>Analytics</a></li>
                        <li><a href="#alerts" onClick={() => setCurrentPage("alerts")}>Alerts</a></li>
                        <li><a href="#settings" onClick={() => setCurrentPage("settings")}>Settings</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header className="dashboard-header">
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