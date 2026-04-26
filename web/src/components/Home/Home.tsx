import '@styles/Home/Home.css';
import RecentTransactions from '@/components/Home/RecentTransactions';
import Inventory from '@/components/Home/Inventory';
import MetricCards from '@/components/Home/MetricCards';

const DashBoard = () => {
    return (
        <div className="grid-container">
            <div className="dashboard-grid">
                <MetricCards />

                <div className="dashboard-panel">
                    <RecentTransactions />
                </div>

                <div className="dashboard-panel">
                    <Inventory />
                </div>
            </div>
        </div>
    );
};

export default DashBoard;
