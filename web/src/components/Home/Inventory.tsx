import '@styles/Home/Inventory.css';
import '@styles/Utils/Buttons.css';
import '@styles/Utils/TableUtils.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, type CSSProperties } from 'react';

import EditInventoryModal from '@/components/Modals/EditInventoryModal';
import ConfirmationModal from '@/components/Modals/ConfirmationModal';
import { useAlert } from '@contexts/SnackBarAlertContext';
import {
    useInventory,
    useRemoveInventorySlotMutation,
    useUpdateInventorySlotMutation,
} from '@/hooks/useInventory';
import { useProducts } from '@/hooks/useProducts';
import type { InventoryItem } from '@/services/types';

type InventorySortColumn = 'location' | 'product' | 'quantity';
type SortDirection = 'asc' | 'desc';

function sortInventory(
    inventory: InventoryItem[],
    sortColumn: InventorySortColumn,
    sortDirection: SortDirection,
) {
    return [...inventory].sort((left, right) => {
        const direction = sortDirection === 'asc' ? 1 : -1;

        switch (sortColumn) {
            case 'location':
                return left.slotLabel.localeCompare(right.slotLabel) * direction;
            case 'product':
                return left.productName.localeCompare(right.productName) * direction;
            case 'quantity':
                return (left.quantity - right.quantity) * direction;
        }
    });
}

const Inventory = () => {
    const { showAlert } = useAlert();
    const inventoryQuery = useInventory();
    const productsQuery = useProducts();
    const updateSlotMutation = useUpdateInventorySlotMutation();
    const removeSlotMutation = useRemoveInventorySlotMutation();

    const [editingSlotID, setEditingSlotID] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [sortColumn, setSortColumn] = useState<InventorySortColumn>('location');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);
    const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
    const inventorySlots = sortInventory(
        inventoryQuery.data ?? [],
        sortColumn,
        sortDirection,
    );
    const allProducts = productsQuery.data ?? [];
    const isLoadingInventory =
        inventoryQuery.isPending ||
        inventoryQuery.isFetching ||
        productsQuery.isPending ||
        updateSlotMutation.isPending ||
        removeSlotMutation.isPending;

    const editingSlotInfo = inventorySlots.find(
        (slot) => slot.slotId === editingSlotID,
    );

    const handleSave = async (
        slotId: number,
        productId: string,
        quantity: number,
    ) => {
        try {
            const product = allProducts.find((p) => p.id === productId);

            if (!product) {
                return;
            }

            await updateSlotMutation.mutateAsync({
                slotId,
                product,
                productId,
                quantity,
            });

            showAlert(`Slot updated successfully!`, 'success');
            setEditingSlotID(null);
        } catch (error) {
            console.error(error);
            showAlert(`Failed to update slot`, 'error');
        }
    };

    const handleRemove = async (slotId: number) => {
        try {
            await removeSlotMutation.mutateAsync(slotId);
            showAlert(`Product removed from slot`, 'success');
        } catch (error) {
            console.error(error);
            showAlert(`Failed to remove product from slot`, 'error');
        }
    };

    const handleDeleteConfirm = (confirmed: boolean) => {
        if (confirmed && slotToDelete !== null) {
            void handleRemove(slotToDelete);
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

                <button
                    className="edit-btn"
                    onClick={() => setIsEditMode(!isEditMode)}
                >
                    <EditIcon />
                </button>
            </div>

            <div
                className={`table-list ${
                    isLoadingInventory ? 'loading-opacity' : ''
                }`}
            >
                {inventorySlots.length > 0 ? (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>
                                    <button
                                        className="table-sort-button"
                                        onClick={() => handleSort('location')}
                                    >
                                        Location {getSortIcon('location')}
                                    </button>
                                </th>

                                <th>
                                    <button
                                        className="table-sort-button"
                                        onClick={() => handleSort('product')}
                                    >
                                        Product {getSortIcon('product')}
                                    </button>
                                </th>

                                <th>
                                    <button
                                        className="table-sort-button"
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
                                const isEmpty = !slot.productId;

                                return (
                                    <tr
                                        key={slot.slotId}
                                        style={
                                            {
                                                '--row-index': index,
                                            } as CSSProperties
                                        }
                                    >
                                        <td>{slot.slotLabel}</td>

                                        <td className={isEmpty ? 'no-product' : ''}>
                                            {isEmpty ? 'NO PRODUCT' : slot.productName}
                                        </td>

                                        <td>{isEmpty ? '' : slot.quantity}</td>

                                        {isEditMode && (
                                            <td>
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
                    key={`${editingSlotInfo.slotId}-${editingSlotInfo.productId}-${editingSlotInfo.quantity}`}
                    isOpen={editingSlotID !== null}
                    onClose={() => setEditingSlotID(null)}
                    onSave={handleSave}
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
