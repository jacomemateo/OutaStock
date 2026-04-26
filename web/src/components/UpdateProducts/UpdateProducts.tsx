import '@styles/UpdateProducts/UpdateProducts.css';
import '@styles/Utils/Buttons.css';
import '@styles/Utils/TableUtils.css';
import '@styles/Utils/PageLayout.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState, type CSSProperties } from 'react';
import { useAlert } from '@contexts/SnackBarAlertContext';
import {
    useCreateProductMutation,
    useDeleteProductMutation,
    useProducts,
    useUpdateProductMutation,
} from '@/hooks/useProducts';
import type { Product } from '@/services/types';
import EditProductModal from '@/components/Modals/EditProductModal';
import ConfirmationModal from '@/components/Modals/ConfirmationModal';
import AddProductModal from '@/components/Modals/AddProductModal';

type ProductSortColumn = 'name' | 'cost' | 'price';
type SortDirection = 'asc' | 'desc';

function filterAndSortProducts(
    products: Product[],
    searchQuery: string,
    sortColumn: ProductSortColumn,
    sortDirection: SortDirection,
) {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filteredProducts = normalizedSearch
        ? products.filter((product) =>
              product.name.toLowerCase().includes(normalizedSearch),
          )
        : products;

    return [...filteredProducts].sort((left, right) => {
        const direction = sortDirection === 'asc' ? 1 : -1;

        switch (sortColumn) {
            case 'name':
                return left.name.localeCompare(right.name) * direction;
            case 'cost':
                return (left.costCents - right.costCents) * direction;
            case 'price':
                return (left.priceCents - right.priceCents) * direction;
        }
    });
}

const UpdateProducts = () => {
    const { showAlert } = useAlert();
    const productsQuery = useProducts();
    const createProductMutation = useCreateProductMutation();
    const updateProductMutation = useUpdateProductMutation();
    const deleteProductMutation = useDeleteProductMutation();

    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<ProductSortColumn>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const allProducts = productsQuery.data ?? [];
    const visibleProducts = filterAndSortProducts(
        allProducts,
        searchQuery,
        sortColumn,
        sortDirection,
    );
    const isLoadingProducts =
        productsQuery.isPending ||
        productsQuery.isFetching ||
        createProductMutation.isPending ||
        updateProductMutation.isPending ||
        deleteProductMutation.isPending;

    const handleSaveNewProduct = async (
        name: string,
        costCents: number,
        priceCents: number,
    ) => {
        try {
            if (
                allProducts.some(
                    (product) => product.name.toLowerCase() === name.toLowerCase(),
                )
            ) {
                showAlert(`${name} already exists. Please add a new product.`, 'error');
                return;
            }

            await createProductMutation.mutateAsync({
                name,
                costCents,
                priceCents,
            });
            showAlert(`${name} added successfully!`, 'success');
        } catch (error) {
            console.error('Error saving new product:', error);
            showAlert('Failed to add product.', 'error');
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteProductMutation.mutateAsync(productId);
            showAlert(`Product deleted successfully!`, 'success');
        } catch (error) {
            console.error('Error deleting product:', error);
            showAlert('Failed to delete product.', 'error');
        } finally {
            setConfirmationOpen(false);
            setProductToDelete(null);
        }
    };

    const handleDeleteDecision = (confirmed: boolean) => {
        if (confirmed && productToDelete !== null) {
            void handleDeleteProduct(productToDelete);
            return;
        }

        setConfirmationOpen(false);
        setProductToDelete(null);
    };

    const handleSaveEditedProduct = async (
        productId: string,
        costCents: number,
        priceCents: number,
    ) => {
        try {
            await updateProductMutation.mutateAsync({
                productId,
                costCents,
                priceCents,
            });
            showAlert('Product updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating product:', error);
            showAlert('Failed to update product.', 'error');
        }
    };

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
                            {visibleProducts.length > 0 ? (
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
                                        {visibleProducts.map((product, index) => (
                                            <tr
                                                key={product.id}
                                                style={
                                                    {
                                                        '--row-index': index,
                                                    } as CSSProperties
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
                                                                    setProductToDelete(
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
                        key={selectedProduct.id}
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
                        onConfirm={handleDeleteDecision}
                        title="Are you sure?"
                        message="This action cannot be undone. Please confirm if you want to proceed."
                    />
                )}
            </div>
        </>
    );
};

export default UpdateProducts;
