import '../styles/Dashboard.css'
import logo from '../assets/transparent-gold-logo.png'

const DashBoard = () => {
    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Company Logo"/>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li><a href="#inventory">Update Product</a></li>
                        <li><a href="#analytics">Analytics</a></li>
                        <li><a href="#settings">Settings</a></li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                </header>
                <div className="content">
                    <p>Welcome to the Dashboard</p>
                </div>
            </main>
        </div>
    )
}

export default DashBoard