import '@styles/Home/Home.css';
import RecentTransactions from '@/components/Home/RecentTransactions';
import Inventory from '@/components/Home/Inventory';
import MetricCards from '@/components/Home/MetricCards';

const DashBoard = () => {
    return (
        <div className="grid-container">
            <div className="dashboard-grid">
                <MetricCards/>

                {/* Transaction History Box */}
                <RecentTransactions />

                {/* Current Inventory Box */}
                <Inventory />

            </div>
        </div>
    );
};

export default DashBoard;
