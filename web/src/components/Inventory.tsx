import '@styles/Inventory.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';

import EditInventoryModal from '@/components/EditInventoryModal';
import ConfirmationModal from '@/components/ConfirmationModal';
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

const Inventory = () => {
    const {showAlert} = useAlert();
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
    const [products, setProducts] = useState<ProductSlot[]>([]);

    /*
    All available products in the system (used for dropdown selection)
    */
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    /*
    Confirmation modal state for deleting a slot product
    */
    const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);
    const [slotToDelete, setSlotToDelete] = useState<number | null>(null);

    /*
    Load vending machine inventory from backend
    */
    const loadInventory = async () => {
        try {
            const data = await fetchInventory(await getInventoryCount(), 0);
            /*
            Ensure we always store an array
            */
            setProducts(data || []);

            console.log('Inventory slots:', data);
        } catch (error) {
            console.error('Failed to load inventory', error);
        }
    };

    /*
    Load all products that can be placed into slots
    */
    const loadAllProducts = async () => {
        try {
            const data = await fetchProducts(await getProductCount(), 0);

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
        loadInventory();
        loadAllProducts();
    }, []);

    /*
    The slot currently being edited (used to populate modal)
    */
    const editingSlotInfo = products.find((slot) => slot.slotId === editingSlotID);

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
            showAlert(`Slot ${slotId} updated successfully!`, 'success');
            /*
            Update local UI state so the table updates immediately
            */
            setProducts(
                products.map((slot) =>
                    slot.slotId === slotId
                        ? {
                              ...slot,
                              productId: productId,
                              productName: product.name,
                              priceCents: product.priceCents,
                              quantity: quantity,
                          }
                        : slot,
                ),
            );

            /*
            Close modal
            */
            setEditingSlotID(null);
        } catch (error) {
            console.error(`Failed to update slot ${slotId}`, error);
            showAlert(`Failed to update slot ${slotId}`, 'error');
        }
    };

    /*
    Remove product from slot
    */
    const handleRemove = async (slotId: number) => {
        try {
            await unassignProductFromSlot(slotId);

            /*
            Reset slot locally
            */
            setProducts(
                products.map((slot) =>
                    slot.slotId === slotId
                        ? {
                              ...slot,
                              productName: '',
                              quantity: 0,
                              productId: '',
                              priceCents: 0,
                              dateAdded: null,
                          }
                        : slot,
                ),
            );
            showAlert(`Product removed from slot ${slotId}`, 'success');

        } catch (error) {
            showAlert(`Failed to remove product from slot ${slotId}`, 'error');
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

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <div>
                    <h2>Inventory</h2>
                    <p className="inventory-subtitle">
                        Products currently in the vending machine
                    </p>
                </div>

                <button className="add-btn" onClick={() => setIsEditMode(!isEditMode)}>
                    <EditIcon />
                </button>
            </div>

            <div className="products-list">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            {isEditMode && <th>Actions</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product, index) => {
                            /*
                            If no productId exists the slot is empty
                            */
                            const isEmpty = !product.productId;

                            return (
                                <tr
                                    key={product.slotId}
                                    className="product-row"
                                    style={
                                        { '--row-index': index } as React.CSSProperties
                                    }
                                >
                                    <td>{product.slotLabel}</td>

                                    <td className={isEmpty ? 'no-product' : ''}>
                                        {isEmpty ? 'NO PRODUCT' : product.productName}
                                    </td>

                                    <td>{isEmpty ? '' : product.quantity}</td>

                                    {isEditMode && (
                                        <td className="edit-btn-cell">
                                            <div className="action-btns">
                                                <button
                                                    className="edit-btn-row"
                                                    onClick={() =>
                                                        setEditingSlotID(product.slotId)
                                                    }
                                                >
                                                    <EditIcon sx={{ fontSize: 20 }} />
                                                </button>

                                                <button
                                                    className="delete-btn-row"
                                                    onClick={() => {
                                                        setSlotToDelete(product.slotId);
                                                        setConfirmationOpen(true);
                                                    }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 20 }} />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
