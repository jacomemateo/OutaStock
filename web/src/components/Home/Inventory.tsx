import '@styles/Home/Inventory.css';
import '@styles/Utils/Buttons.css';
import '@styles/Utils/TableUtils.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';

import EditInventoryModal from '@/components/Modals/EditInventoryModal';
import ConfirmationModal from '@/components/Modals/ConfirmationModal';
import { useAlert } from '@contexts/SnackBarAlertContext';

import {
    fetchInventory,
    unassignProductFromSlot,
    fetchProducts,
    updateSlotProductAndQuantity,
    getInventoryCount,
    getProductCount,
} from '@/services/api';

/*
Represents a slot inside the vending machine.
Each slot may or may not contain a product.
*/
interface ProductSlot {
    slotId: number;
    slotLabel: string;
    quantity: number;
    productName: string;
    priceCents: number;
    productId: string;
    dateAdded: string | null;
}

/*
Represents a product returned from the products API.
We store the full object so we can access UUID + name + price.
*/
interface Product {
    id: string;
    name: string;
    priceCents: number;
    dateCreated: string;
}

type InventorySortColumn = 'location' | 'product' | 'quantity';
type SortDirection = 'asc' | 'desc';

const Inventory = () => {
    const { showAlert } = useAlert();
    /*
    Which slot is currently being edited
    */
    const [editingSlotID, setEditingSlotID] = useState<number | null>(null);

    /*
    Whether edit mode is enabled (shows edit/delete buttons)
    */
    const [isEditMode, setIsEditMode] = useState<boolean>(false);

    /*
    Current inventory slots loaded from backend
    */
    const [inventorySlots, setInventorySlots] = useState<ProductSlot[]>([]);

    const [isLoadingInventory, setIsLoadingInventory] = useState(false);
    const [sortColumn, setSortColumn] = useState<InventorySortColumn>('location');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    /*
    All available products in the system (used for dropdown selection)
    */
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    /*
    Confirmation modal state for deleting a slot product
    */
    const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);
    const [slotToDelete, setSlotToDelete] = useState<number | null>(null);

    const extractCount = (countData: unknown) =>
        typeof countData === 'number'
            ? countData
            : Number((countData as { count?: number })?.count ?? 0);

    /*
    Load vending machine inventory from backend
    */
    const loadInventory = async () => {
        setIsLoadingInventory(true);
        try {
            const inventoryCount = extractCount(await getInventoryCount());
            const data = await fetchInventory(inventoryCount, 0, {
                sortBy: sortColumn,
                sortDir: sortDirection,
            });
            /*
            Ensure we always store an array
            */
            setInventorySlots(data || []);

            console.log('Inventory slots:', data);
        } catch (error) {
            console.error('Failed to load inventory', error);
        } finally {
            setIsLoadingInventory(false);
        }
    };

    /*
    Load all products that can be placed into slots
    */
    const loadAllProducts = async () => {
        try {
            const productCount = extractCount(await getProductCount());
            const data = await fetchProducts(productCount, 0, {
                sortBy: 'name',
                sortDir: 'asc',
            });

            /*
            Store full product objects so we have access to id + name
            */
            setAllProducts(data);

            console.log('All products:', data);
        } catch (error) {
            console.error('Failed to load all products', error);
        }
    };

    /*
    Load inventory and product catalog when component mounts
    */
    useEffect(() => {
        loadAllProducts();
    }, []);

    useEffect(() => {
        loadInventory();
    }, [sortColumn, sortDirection]);

    /*
    The slot currently being edited (used to populate modal)
    */
    const editingSlotInfo = inventorySlots.find((slot) => slot.slotId === editingSlotID);

    /*
    Handle saving changes from the modal
    */
    const handleSave = async (slotId: number, productId: string, quantity: number) => {
        try {
            /*
            Find the selected product using its UUID
            */
            const product = allProducts.find((p) => p.id === productId);

            if (!product) {
                console.error('Selected product not found');
                return;
            }

            console.log(
                `Saving slot ${slotId} with product "${product.name}" (UUID: ${productId}) and quantity ${quantity}`,
            );

            /*
            Update backend
            */
            await updateSlotProductAndQuantity(slotId, productId, quantity);
            showAlert(`Slot updated successfully!`, 'success');
            await loadInventory();

            /*
            Close modal
            */
            setEditingSlotID(null);
        } catch (error) {
            console.error(`Failed to update slot ${slotId}`, error);
            showAlert(`Failed to update slot`, 'error');
        }
    };

    /*
    Remove product from slot
    */
    const handleRemove = async (slotId: number) => {
        try {
            await unassignProductFromSlot(slotId);
            await loadInventory();
            showAlert(`Product removed from slot`, 'success');
        } catch (error) {
            showAlert(`Failed to remove product from slot`, 'error');
            console.error(`Failed to remove product from slot ${slotId}`, error);
        }
    };

    /*
    Confirmation modal result handler
    */
    const handleDeleteConfirm = (confirmed: boolean) => {
        if (confirmed && slotToDelete !== null) {
            handleRemove(slotToDelete);
        }

        setConfirmationOpen(false);
        setSlotToDelete(null);
    };

    const handleSort = (column: InventorySortColumn) => {
        if (sortColumn !== column) {
            setSortColumn(column);
            setSortDirection('asc');
            return;
        }

        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const getSortIcon = (column: InventorySortColumn) => {
        if (sortColumn !== column) return '';
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    return (
        <div className="page-card">
            <div className="card-header">
                <div>
                    <h2>Inventory</h2>
                    <p className="card-subtitle">
                        Products currently in the vending machine
                    </p>
                </div>

                <button className="edit-btn" onClick={() => setIsEditMode(!isEditMode)}>
                    <EditIcon />
                </button>
            </div>

            <div className={`table-list ${isLoadingInventory ? 'loading-opacity' : ''}`}>
                {inventorySlots.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>
                                    <button
                                        className="table-sort-button"
                                        type="button"
                                        onClick={() => handleSort('location')}
                                    >
                                        Location {getSortIcon('location')}
                                    </button>
                                </th>

                                <th>
                                    <button
                                        className="table-sort-button"
                                        type="button"
                                        onClick={() => handleSort('product')}
                                    >
                                        Product Name {getSortIcon('product')}
                                    </button>
                                </th>

                                <th>
                                    <button
                                        className="table-sort-button"
                                        type="button"
                                        onClick={() => handleSort('quantity')}
                                    >
                                        Quantity {getSortIcon('quantity')}
                                    </button>
                                </th>

                                {isEditMode && <th>Actions</th>}
                            </tr>
                        </thead>

                        <tbody>
                            {inventorySlots.map((slot, index) => {
                                /*
                                If no productId exists the slot is empty
                                */
                                const isEmpty = !slot.productId;

                                return (
                                    <tr
                                        key={slot.slotId}
                                        style={
                                            {
                                                '--row-index': index,
                                            } as React.CSSProperties
                                        }
                                    >
                                        <td>{slot.slotLabel}</td>

                                        <td className={isEmpty ? 'no-product' : ''}>
                                            {isEmpty ? 'NO PRODUCT' : slot.productName}
                                        </td>

                                        <td>{isEmpty ? '' : slot.quantity}</td>

                                        {isEditMode && (
                                            <td className="edit-btn-cell">
                                                <div className="action-btns">
                                                    <button
                                                        className="edit-btn-row"
                                                        onClick={() =>
                                                            setEditingSlotID(slot.slotId)
                                                        }
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </button>

                                                    <button
                                                        className="delete-btn-row"
                                                        onClick={() => {
                                                            setSlotToDelete(slot.slotId);
                                                            setConfirmationOpen(true);
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p className="no-transactions">No inventory found</p>
                )}
            </div>

            {editingSlotInfo && (
                <EditInventoryModal
                    isOpen={editingSlotID !== null}
                    onClose={() => setEditingSlotID(null)}
                    onSave={handleSave}
                    /*
                    Pass full product catalog
                    */
                    inventory={allProducts}
                    slotID={editingSlotInfo.slotId}
                    slotLabel={editingSlotInfo.slotLabel}
                    currentProductName={editingSlotInfo.productName}
                    currentQuantity={editingSlotInfo.quantity}
                />
            )}

            {confirmationOpen && (
                <ConfirmationModal
                    isOpen={confirmationOpen}
                    onClose={() => setConfirmationOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title="Are you sure?"
                    message="This action cannot be undone. Please confirm if you want to proceed."
                />
            )}
        </div>
    );
};

export default Inventory;
