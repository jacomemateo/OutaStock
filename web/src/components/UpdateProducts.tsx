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
import AddProductModal from '@components/AddProductModal';
import { useAlert } from '@contexts/SnackBarAlertContext';
import {fetchInventory, getInventoryCount, createProduct} from '@/services/api';
interface Product {
    id: number;
    name: string;
    priceCents: number;
    dateCreated: string;
}

// interface InventoryItem{
//     slotId: number;
//     slotLabel: string;
//     quantity: number;
//     productName: string;
//     priceCents: number;
//     productId: string;
//     dateAdded: string;
// }

const UpdateProducts = () => {
    const { showAlert } = useAlert();
    const [products, setProducts] = useState<Product[]>([]);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);

    // Not working
    // const getLowStockCount = async () => {
    //     try{
    //         const inventoryData = await getAllInventory();
    //         console.log('Inventory data for low stock count:', inventoryData);
    //         const lowStockItems = inventoryData.filter((item: any) => item.quantity < 5);
    //         setLowStockCount(lowStockItems.length);
    //     } catch (error) {
    //         console.error('Error fetching low stock count:', error);

    //     }
    // }

    const loadInventory = async () => {
        try {
            const data = await fetchInventory(await getInventoryCount(), 0);
            /*
                    Ensure we always store an array
                    */
            const lowStockItems = data.filter((item: any) => item.quantity < 5);
            setLowStockCount(lowStockItems.length);

            console.log('Inventory slots:', data);
        } catch (error) {
            console.error('Failed to load inventory', error);
        }
    };
    const loadProducts = async () => {
        try {
            const data = await fetchProducts(await getProductCount(), 0);
            setProducts(data);
            console.log('Loaded products:', data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const handleSaveNewProduct = async (name: string, priceCents: number) => {
        if (
            products.some((product) => product.name.toLowerCase() === name.toLowerCase())
        ) {
            showAlert(`${name} already exists. Please add a new product.`, 'error');
            return;
        }
        try {
            // const newProduct = await createProduct(name, priceCents);
            // setProducts((prevProducts) => [...prevProducts, newProduct]);
            await createProduct(name, priceCents);
            await loadProducts(); // Reload fresh data from backend
            showAlert(`${name} added successfully!`, 'success');
        } catch (error) {
            console.error('Error saving new product:', error);
            showAlert('Failed to add product.', 'error');
        }
    };

    useEffect(() => {
        // getLowStockCount();
        loadProducts();
        loadInventory();
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
                    <p className="card-value">{lowStockCount}</p>
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
                        <AddIcon
                            onClick={() =>
                                setIsAddProductModalOpen(!isAddProductModalOpen)
                            }
                        />
                    </div>
                    {isAddProductModalOpen && (
                        <AddProductModal
                            isOpen={isAddProductModalOpen}
                            onClose={() => setIsAddProductModalOpen(false)}
                            onSave={handleSaveNewProduct}
                        />
                    )}
                </div>

                <div className="products-list">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Cost</th>
                                <th>Price</th>
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
