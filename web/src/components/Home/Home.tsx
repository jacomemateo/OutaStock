import { useState } from 'react';

import '@styles/Home/Home.css';
import RecentTransactions from '@/components/Home/RecentTransactions';
import Inventory from '@/components/Home/Inventory';
import MetricCards from '@/components/Home/MetricCards';

const DashBoard = () => {
    // 🔁 used to trigger metric refresh
    const [metricRefreshKey, setMetricRefreshKey] = useState(0);

    return (
        <div className="grid-container">
            <div className="dashboard-grid">
                {/* Top full-width metrics */}
                <MetricCards refreshKey={metricRefreshKey} />

                {/* Transaction History Box */}
                <div className="dashboard-panel">
                    <RecentTransactions />
                </div>

                {/* Current Inventory Box */}
                <div className="dashboard-panel">
                    <Inventory
                        onInventoryChange={() =>
                            setMetricRefreshKey((prev) => prev + 1)
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default DashBoard;
