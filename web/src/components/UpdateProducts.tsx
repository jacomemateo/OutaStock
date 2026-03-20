import '@styles/UpdateProducts.css';
import InventoryIcon from '@mui/icons-material/Inventory';
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';

const UpdateProducts = () => {
    return (
        <>
            <div className="metric-cards">
                <div className="card total-items-card">
                    <h2 className='card-title'> <InventoryIcon sx={{ color: "var(--umbc-gold)" }}/> Total Items</h2>
                    <p className="card-subtitle">Total items in stock</p>
                    <p className="card-value">120</p>
                </div>

                <div className="card low-stock-card">
                    <h2 className='card-title'> <BatteryCharging20Icon sx={{ color: "yellow" }}/> Low Stock Items</h2>
                    <p className="card-subtitle">Number of items that are running low</p>
                    <p className="card-value">30</p>
                </div>

                <div className="card out-of-stock-card">
                    <h2 className='card-title'> <HourglassDisabledIcon sx={{ color: "grey" }}/> Out of Stock Items</h2>
                    <p className="card-subtitle">Number of items that are out of stock</p>
                    <p className="card-value">30</p>
                </div>

                <div className="card expired-card">
                    <h2 className='card-title'> <RunningWithErrorsIcon sx={{ color: "red" }}/> Expired Items</h2>
                    <p className="card-subtitle">Number of items that are expired</p>
                    <p className="card-value">30</p>
                </div>
            </div>

            <div className="update-products-container">
                <div className="update-products-header">
                    <h2>Products Overview</h2>
                    <p className="update-products-subtitle">
                        View and modify all products
                    </p>
                </div>
            </div>
        </>
    );
};

export default UpdateProducts;
