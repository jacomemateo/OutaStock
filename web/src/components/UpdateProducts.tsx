import '@styles/UpdateProducts.css';
import InventoryIcon from '@mui/icons-material/Inventory';
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { fetchProducts, getProductCount } from '@/services/api';
import { FaBoxOpen } from 'react-icons/fa';

interface Product {
    id: number;
    name: string;
    priceCents: number;
    dateCreated: string;
}

const UpdateProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);

    const loadProducts = async () => {
        try {
            const data = await fetchProducts(await getProductCount(), 0);
            setProducts(data);
            console.log('Loaded products:', data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <>
            <div className="metric-cards">
                <div className="card total-items-card">
                    <h2 className="card-title">
                        {' '}
                        <InventoryIcon sx={{ color: 'var(--umbc-gold)' }} /> Total Items
                    </h2>
                    <p className="card-subtitle">Total items in stock</p>
                    <p className="card-value">{products.length}</p>
                </div>

                <div className="card low-stock-card">
                    <h2 className="card-title">
                        {' '}
                        <BatteryCharging20Icon sx={{ color: 'yellow' }} /> Low Stock Items
                    </h2>
                    <p className="card-subtitle">Number of items that are running low</p>
                    <p className="card-value">30</p>
                </div>

                <div className="card out-of-stock-card">
                    <h2 className="card-title">
                        {' '}
                        <HourglassDisabledIcon sx={{ color: 'grey' }} /> Out of Stock
                        Items
                    </h2>
                    <p className="card-subtitle">Number of items that are out of stock</p>
                    <p className="card-value">30</p>
                </div>

                <div className="card expired-card">
                    <h2 className="card-title">
                        {' '}
                        <RunningWithErrorsIcon sx={{ color: 'red' }} /> Expired Items
                    </h2>
                    <p className="card-subtitle">Number of items that are expired</p>
                    <p className="card-value">30</p>
                </div>
            </div>

            <div className="update-products-container">
                <div className="update-products-header">
                    <div>
                        <h2>Products Overview</h2>
                        <p className="update-products-subtitle">
                            View and modify all products
                        </p>
                    </div>
                    <div className="add-product-btn">
                        <AddIcon  />
                    </div>
                </div>

                <div className="products-list">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Cost</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product, index) => (
                                <tr
                                    key={product.id}
                                    className="product-row"
                                    style={
                                        { '--row-index': index } as React.CSSProperties
                                    }
                                >
                                    <td>{product.name}</td>
                                    <td>Waiting</td>
                                    <td>{(product.priceCents / 100).toFixed(2)}</td>
                                    <td className="all-products-stock">
                                        📦 {product.priceCents}
                                    </td>
                                    <td>
                                        <button className="edit-btn-row">
                                            <EditIcon fontSize="small" />
                                        </button>
                                        <button className="delete-btn-row">
                                            <DeleteIcon fontSize="small" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default UpdateProducts;
