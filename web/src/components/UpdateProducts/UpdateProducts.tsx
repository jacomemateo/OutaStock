// Styles
import '@styles/UpdateProducts/UpdateProducts.css';
import '@styles/Utils/Buttons.css';
import '@styles/Utils/TableUtils.css';
import '@styles/Utils/PageLayout.css';
// Icons
import InventoryIcon from '@mui/icons-material/Inventory';
import HourglassDisabledIcon from '@mui/icons-material/HourglassDisabled';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import BatteryCharging20Icon from '@mui/icons-material/BatteryCharging20';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
// React
import { useEffect, useState } from 'react';
// Api functions
import { fetchProducts, getProductCount } from '@/services/api';
import { useAlert } from '@contexts/SnackBarAlertContext';
import { fetchInventory, getInventoryCount, createProduct } from '@/services/api';
import { deleteProduct } from '@/services/api';
import { updateProductPrice, updateProductCost } from '@/services/api';
// Modals
import EditProductModal from '@/components/Modals/EditProductModal';
import ConfirmationModal from '@/components/Modals/ConfirmationModal';
import AddProductModal from '@/components/Modals/AddProductModal';

interface Product {
    id: string;
    name: string;
    costCents: number;
    priceCents: number;
    dateCreated: string;
}

const UpdateProducts = () => {
    const { showAlert } = useAlert();
    const [products, setProducts] = useState<Product[]>([]);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);
    const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

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

    const handleSaveNewProduct = async (
        name: string,
        costCents: number,
        priceCents: number,
    ) => {
        if (
            products.some((product) => product.name.toLowerCase() === name.toLowerCase())
        ) {
            showAlert(`${name} already exists. Please add a new product.`, 'error');
            return;
        }
        try {
            // const newProduct = await createProduct(name, priceCents);
            // setProducts((prevProducts) => [...prevProducts, newProduct]);
            await createProduct(name, costCents, priceCents);
            await loadProducts(); // Reload fresh data from backend
            showAlert(`${name} added successfully!`, 'success');
        } catch (error) {
            console.error('Error saving new product:', error);
            showAlert('Failed to add product.', 'error');
        }
    };

    const handleDeleteProduct = async (productID: string) => {
        try {
            await deleteProduct(productID);
            showAlert(`Product deleted successfully!`, 'success');
            await loadProducts(); // Reload fresh data from backend
        } catch (error) {
            console.error('Error deleting product:', error);
            showAlert('Failed to delete product.', 'error');
        }
    };

    const getUserDecision = (confirmed: boolean) => {
        if (confirmed && slotToDelete !== null) {
            handleDeleteProduct(slotToDelete);
        }
        setConfirmationOpen(false);
        setSlotToDelete(null);
    };

    const handleSaveEditedProduct = async (
        productId: string,
        costCents: number,
        priceCents: number,
    ) => {
        try {
            await updateProductPrice(productId, priceCents);

            await updateProductCost(productId, costCents);

            await loadProducts();
            showAlert('Product updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating product:', error);
            showAlert('Failed to update product.', 'error');
        }
    };

    useEffect(() => {
        // getLowStockCount();
        loadProducts();
        loadInventory();
    }, []);

    return (
        <>
            <div className="grid-container">
                <div className="update-products-grid">
                    <div className="metric-grid">
                        <div className="metric-card total-items-card">
                            <h2 className="metric-card-title">
                                <InventoryIcon className="metric-icon-accent" /> Total Items
                            </h2>
                            <p className="metric-card-subtitle">Total items in stock</p>
                            <p className="metric-card-value">{products.length}</p>
                        </div>

                        <div className="metric-card low-stock-card">
                            <h2 className="metric-card-title">
                                <BatteryCharging20Icon className="metric-icon-warning" /> Low
                                Stock Items
                            </h2>
                            <p className="metric-card-subtitle">
                                Number of items that are running low
                            </p>
                            <p className="metric-card-value">{lowStockCount}</p>
                        </div>

                        <div className="metric-card out-of-stock-card">
                            <h2 className="metric-card-title">
                                <HourglassDisabledIcon className="metric-icon-neutral" /> Out
                                of Stock Items
                            </h2>
                            <p className="metric-card-subtitle">
                                Number of items that are out of stock
                            </p>
                            <p className="metric-card-value">30</p>
                        </div>

                        <div className="metric-card expired-card">
                            <h2 className="metric-card-title">
                                <RunningWithErrorsIcon className="metric-icon-danger" />{' '}
                                Expired Items
                            </h2>
                            <p className="metric-card-subtitle">
                                Number of items that are expired
                            </p>
                            <p className="metric-card-value">30</p>
                        </div>
                    </div>

                    <div className="page-card">
                        <div className="card-header">
                            <div>
                                <h2>Products Overview</h2>
                                <p className="card-subtitle">View and modify all products</p>
                            </div>
                            <div className="update-products-actions">
                                <button
                                    className="edit-btn"
                                    onClick={() => setIsEditMode(!isEditMode)}
                                >
                                    <EditIcon />
                                </button>

                                <button
                                    className="add-btn"
                                    onClick={() =>
                                        setIsAddProductModalOpen(!isAddProductModalOpen)
                                    }
                                >
                                    <AddIcon />
                                </button>
                            </div>
                        </div>

                        <div className="table-list">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="col-product">Product</th>
                                        <th className="col-cost">Cost</th>
                                        <th className="col-price">Price</th>
                                        {isEditMode && <th className="col-actions">Actions</th>}
                                    </tr>
                                </thead>

                                <tbody>
                                    {products.map((product, index) => (
                                        <tr
                                            key={product.id}
                                            className="product-row"
                                            style={
                                                {
                                                    '--row-index': index,
                                                } as React.CSSProperties
                                            }
                                        >
                                            <td>{product.name}</td>
                                            <td>${(product.costCents / 100).toFixed(2)}</td>
                                            <td>${(product.priceCents / 100).toFixed(2)}</td>
                                            {isEditMode && (
                                                <td className="edit-btn-cell">
                                                    <div className="action-btns">
                                                        <button
                                                            className="edit-btn-row"
                                                            onClick={() => {
                                                                setIsEditProductModalOpen(true);
                                                                setSelectedProduct(product);
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </button>

                                                        <button
                                                            className="delete-btn-row"
                                                            onClick={() => {
                                                                setConfirmationOpen(true);
                                                                setSlotToDelete(product.id);
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {isAddProductModalOpen && (
                    <AddProductModal
                        isOpen={isAddProductModalOpen}
                        onClose={() => setIsAddProductModalOpen(false)}
                        onSave={handleSaveNewProduct}
                    />
                )}

                {isEditProductModalOpen && selectedProduct && (
                    <EditProductModal
                        isOpen={isEditProductModalOpen}
                        onClose={() => setIsEditProductModalOpen(false)}
                        onSave={handleSaveEditedProduct}
                        product={selectedProduct}
                    />
                )}

                {confirmationOpen && (
                    <ConfirmationModal
                        isOpen={confirmationOpen}
                        onClose={() => setConfirmationOpen(false)}
                        onConfirm={getUserDecision}
                        title="Are you sure?"
                        message="This action cannot be undone. Please confirm if you want to proceed."
                    />
                )}
            </div>
        </>
    );
};

export default UpdateProducts;