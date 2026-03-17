import { useState, useEffect } from 'react';
import '@styles/EditInventoryModal.css';
import { FormControl } from '@mui/material';

/*
Product type coming from your backend.
We store the full object in `inventory` so we have access to the UUID.
*/
interface Product {
    id: string;
    name: string;
    priceCents: number;
    dateCreated: string;
}

interface EditInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;

    /*
    IMPORTANT CHANGE:
    onSave now receives the product UUID instead of the product name.
    */
    onSave: (slotID: number, productId: string, quantity: number) => void;

    /*
    We now pass the FULL product objects instead of just names.
    */
    inventory: Product[];

    slotID: number;
    slotLabel: string;

    /*
    Used to pre-fill the modal when editing an existing slot.
    */
    currentProductName: string;
    currentQuantity: number;
}

const EditInventoryModal = ({
    isOpen,
    onClose,
    onSave,
    inventory,
    slotID,
    slotLabel,
    currentProductName,
    currentQuantity,
}: EditInventoryModalProps) => {
    /*
    FORM STATE

    Instead of storing productName we store productId.
    This prevents the UUID mismatch bug you were seeing.
    */
    const [formData, setFormData] = useState({
        productId: '',
        quantity: currentQuantity.toString(),
    });

    /*
    When the modal opens, we want to set the initial productId
    based on the current product name.

    This finds the matching product object and sets its UUID.
    */
    useEffect(() => {
        const product = inventory.find((p) => p.name === currentProductName);
        console.log('Found product for currentProductName:', product);

        setFormData({
            productId: product ? product.id : '',
            quantity: currentQuantity.toString(),
        });
    }, [inventory, currentProductName, currentQuantity]);

    /*
    Submit handler
    */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        /*
        Ensure a product is selected
        */
        if (formData.productId) {
            /*
            Send the UUID back to Inventory.tsx
            */
            onSave(slotID, formData.productId, parseInt(formData.quantity) || 0);

            /*
            Close modal after save
            */
            onClose();
        }
    };

    /*
    If modal is closed, render nothing
    */
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editing Slot {slotLabel}</h2>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth className="product-select" sx={{ mb: 2 }}>
                        <label id="product-select-label">Product</label>

                        {/*
                        IMPORTANT FIX:

                        value = product UUID
                        label = product name

                        This ensures the backend receives the correct product ID.
                        */}
                        <select
                            className="product-select"
                            value={formData.productId}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    productId: e.target.value,
                                })
                            }
                        >
                            <option value="">-- Select Product --</option>

                            {inventory.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </FormControl>

                    {/*
                    Quantity input
                    */}
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                quantity: e.target.value,
                            })
                        }
                    />

                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditInventoryModal;
