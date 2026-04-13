import '@styles/Home/Home.css';
import RecentTransactions from '@/components/Home/RecentTransactions';
import Inventory from '@/components/Home/Inventory';

const DashBoard = () => {
    return (
        <div className="grid-container">
            <div className="dashboard-grid">
                {/* Transaction History Box */}
                <RecentTransactions />

                {/* Current Inventory Box */}
                <Inventory />
            </div>
        </div>
    );
};

export default DashBoard;
