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

type ProductSortColumn = 'name' | 'cost' | 'price';
type SortDirection = 'asc' | 'desc';

const UpdateProducts = () => {
    const { showAlert } = useAlert();
    const [products, setProducts] = useState<Product[]>([]);
    const [totalProductCount, setTotalProductCount] = useState(0);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);
    const [slotToDelete, setSlotToDelete] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<ProductSortColumn>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const extractCount = (countData: unknown) =>
        typeof countData === 'number'
            ? countData
            : Number((countData as { count?: number })?.count ?? 0);

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
            const inventoryCount = extractCount(await getInventoryCount());
            const data = await fetchInventory(inventoryCount, 0, {
                sortBy: 'location',
                sortDir: 'asc',
            });
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
        setIsLoadingProducts(true);
        try {
            const [filteredCountData, totalCountData] = await Promise.all([
                getProductCount(searchQuery),
                getProductCount(),
            ]);

            const filteredCount = extractCount(filteredCountData);
            const totalCount = extractCount(totalCountData);

            const data = await fetchProducts(filteredCount, 0, {
                search: searchQuery,
                sortBy: sortColumn,
                sortDir: sortDirection,
            });

            setProducts(data);
            setTotalProductCount(totalCount);
            console.log('Loaded products:', data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleSaveNewProduct = async (
        name: string,
        costCents: number,
        priceCents: number,
    ) => {
        try {
            const existingProductCount = extractCount(await getProductCount());
            const existingProducts = await fetchProducts(existingProductCount, 0, {
                sortBy: 'name',
                sortDir: 'asc',
            });

            if (
                existingProducts.some(
                    (product: Product) => product.name.toLowerCase() === name.toLowerCase(),
                )
            ) {
                showAlert(`${name} already exists. Please add a new product.`, 'error');
                return;
            }

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
        loadInventory();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [searchQuery, sortColumn, sortDirection]);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSearchQuery(searchInput.trim());
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
    };

    const handleSort = (column: ProductSortColumn) => {
        if (sortColumn !== column) {
            setSortColumn(column);
            setSortDirection('asc');
            return;
        }

        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const getSortIcon = (column: ProductSortColumn) => {
        if (sortColumn !== column) return '';
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    return (
        <>
            <div className="grid-container">
                <div className="update-products-grid">
                    <div className="metric-grid">
                        <div className="metric-card total-items-card">
                            <h2 className="metric-card-title">
                                <InventoryIcon className="metric-icon-accent" /> Total
                                Items
                            </h2>
                            <p className="metric-card-subtitle">Total items in stock</p>
                            <p className="metric-card-value">{totalProductCount}</p>
                        </div>

                        <div className="metric-card low-stock-card">
                            <h2 className="metric-card-title">
                                <BatteryCharging20Icon className="metric-icon-warning" />{' '}
                                Low Stock Items
                            </h2>
                            <p className="metric-card-subtitle">
                                Number of items that are running low
                            </p>
                            <p className="metric-card-value">{lowStockCount}</p>
                        </div>

                        <div className="metric-card out-of-stock-card">
                            <h2 className="metric-card-title">
                                <HourglassDisabledIcon className="metric-icon-neutral" />{' '}
                                Out of Stock Items
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
                                <p className="card-subtitle">
                                    View and modify all products
                                </p>
                            </div>


                        </div>

                        <div className="table-toolbar">
                            <form
                                className="table-search-form"
                                onSubmit={handleSearchSubmit}
                            >
                                <input
                                    className="table-search-input"
                                    type="search"
                                    value={searchInput}
                                    onChange={(event) =>
                                        setSearchInput(event.target.value)
                                    }
                                    placeholder="Search by product name"
                                    aria-label="Search products by product name"
                                />

                                <button
                                    className="table-control-btn"
                                    type="submit"
                                    disabled={isLoadingProducts}
                                >
                                    Search
                                </button>

                                {(searchInput || searchQuery) && (
                                    <button
                                        className="table-control-btn-secondary"
                                        type="button"
                                        onClick={handleClearSearch}
                                        disabled={isLoadingProducts}
                                    >
                                        Clear
                                    </button>
                                )}
                            </form>

                            {/* {searchQuery && (
                                <p className="table-status">
                                    Showing results for "{searchQuery}"
                                </p>
                            )} */}

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

                        <div
                            className={`table-list ${
                                isLoadingProducts ? 'loading-opacity' : ''
                            }`}
                        >
                            {products.length > 0 ? (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="col-product">
                                                <button
                                                    className="table-sort-button"
                                                    type="button"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    Product {getSortIcon('name')}
                                                </button>
                                            </th>

                                            <th className="col-cost">
                                                <button
                                                    className="table-sort-button"
                                                    type="button"
                                                    onClick={() => handleSort('cost')}
                                                >
                                                    Cost {getSortIcon('cost')}
                                                </button>
                                            </th>

                                            <th className="col-price">
                                                <button
                                                    className="table-sort-button"
                                                    type="button"
                                                    onClick={() => handleSort('price')}
                                                >
                                                    Price {getSortIcon('price')}
                                                </button>
                                            </th>

                                            {isEditMode && (
                                                <th className="col-actions">Actions</th>
                                            )}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {products.map((product, index) => (
                                            <tr
                                                key={product.id}
                                                style={
                                                    {
                                                        '--row-index': index,
                                                    } as React.CSSProperties
                                                }
                                            >
                                                <td>{product.name}</td>
                                                <td>
                                                    $
                                                    {(product.costCents / 100).toFixed(2)}
                                                </td>
                                                <td>
                                                    $
                                                    {(product.priceCents / 100).toFixed(
                                                        2,
                                                    )}
                                                </td>
                                                {isEditMode && (
                                                    <td className="edit-btn-cell">
                                                        <div className="action-btns">
                                                            <button
                                                                className="edit-btn-row"
                                                                onClick={() => {
                                                                    setIsEditProductModalOpen(
                                                                        true,
                                                                    );
                                                                    setSelectedProduct(
                                                                        product,
                                                                    );
                                                                }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </button>

                                                            <button
                                                                className="delete-btn-row"
                                                                onClick={() => {
                                                                    setConfirmationOpen(
                                                                        true,
                                                                    );
                                                                    setSlotToDelete(
                                                                        product.id,
                                                                    );
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
                            ) : (
                                <p className="no-transactions">No products found</p>
                            )}
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
