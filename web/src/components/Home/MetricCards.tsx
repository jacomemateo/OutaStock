// Icons
import InventoryIcon from '@mui/icons-material/Inventory';
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import { useMetrics } from '@/hooks/useMetrics';

const MetricCards = () => {
    const { data: metrics } = useMetrics();
    const totalProductCount = metrics?.totalProductCount ?? 0;
    const lowStockCount = metrics?.lowStockCount ?? 0;
    const outOfStockCount = metrics?.outOfStockCount ?? 0;

    return (
        <div className="metric-grid">
            <div className="metric-card total-items-card">
                <h2 className="metric-card-title">
                    <InventoryIcon className="metric-icon-accent" /> Total Items
                </h2>
                <p className="metric-card-subtitle">Total items in stock</p>
                <p className="metric-card-value">{totalProductCount}</p>
            </div>

            <div className="metric-card low-stock-card">
                <h2 className="metric-card-title">
                    <BatteryCharging20Icon className="metric-icon-warning" /> Low Stock
                    Items
                </h2>
                <p className="metric-card-subtitle">
                    Number of items that are running low
                </p>
                <p className="metric-card-value">{lowStockCount}</p>
            </div>

            <div className="metric-card out-of-stock-card">
                <h2 className="metric-card-title">
                    <HourglassDisabledIcon className="metric-icon-neutral" /> Out of Stock
                    Items
                </h2>
                <p className="metric-card-subtitle">
                    Number of items that are out of stock
                </p>
                <p className="metric-card-value">{outOfStockCount}</p>
            </div>
        </div>
    );
};

export default MetricCards;
