import { useEffect, useState } from 'react';

// Icons
import InventoryIcon from '@mui/icons-material/Inventory';
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';

// API
import { getProductCount, getInventoryCount, fetchInventory } from '@/services/api';

const MetricCards = () => {
    const [lowStockCount, setLowStockCount] = useState(0);
    const [totalProductCount, setTotalProductCount] = useState(0);

    const extractCount = (countData: unknown) =>
        typeof countData === 'number'
            ? countData
            : Number((countData as { count?: number })?.count ?? 0);

    const loadData = async () => {
        try {
            // total products
            const total = extractCount(await getProductCount());
            setTotalProductCount(total);

            // inventory → low stock
            const inventoryCount = extractCount(await getInventoryCount());
            const inventory = await fetchInventory(inventoryCount, 0, {
                sortBy: 'location',
                sortDir: 'asc',
            });

            const lowStockItems = inventory.filter((item: any) => item.quantity < 5);
            setLowStockCount(lowStockItems.length);
        } catch (err) {
            console.error('Failed to load metric data', err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

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
                    <BatteryCharging20Icon className="metric-icon-warning" /> Low Stock Items
                </h2>
                <p className="metric-card-subtitle">
                    Number of items that are running low
                </p>
                <p className="metric-card-value">{lowStockCount}</p>
            </div>

            <div className="metric-card out-of-stock-card">
                <h2 className="metric-card-title">
                    <HourglassDisabledIcon className="metric-icon-neutral" /> Out of Stock Items
                </h2>
                <p className="metric-card-subtitle">
                    Number of items that are out of stock
                </p>
                <p className="metric-card-value">30</p>
            </div>

        </div>
    );
};

export default MetricCards;