import { useState } from 'react';
import '@styles/EditInventoryModal.css';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import Label from 'node_modules/@mui/icons-material/Label';

interface EditInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (slotID: number, productName: string, quantity: number) => void;
    inventory: string[]; // List of all product names for the dropdown
    slotID: number; // ID of the slot being edited
    slotLabel: string; // Label of the slot being edited (e.g., "Slot 1")
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
    const [formData, setFormData] = useState({
        productName: currentProductName,
        quantity: currentQuantity.toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.productName.trim()) {
            // When submitting make the quantity a number instead of a string
            onSave(slotID, formData.productName, parseInt(formData.quantity) || 0);
            setFormData({ productName: '', quantity: '' });
            onClose();
        }
    };

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
                        <select
                            className="product-select"
                            value={formData.productName}
                            onChange={(e) =>
                                setFormData({ ...formData, productName: e.target.value })
                            }
                        >
                            <option value="">-- Select Product --</option>

                            {inventory.map((product) => (
                                <option key={product} value={product}>
                                    {product}
                                </option>
                            ))}
                        </select>
                    </FormControl>
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={(e) =>
                            setFormData({ ...formData, quantity: e.target.value })
                        }
                    />
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditInventoryModal;
