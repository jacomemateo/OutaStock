import { useState } from 'react';
import { FormControl } from '@mui/material';

interface Product {
    id: string;
    name: string;
    priceCents: number;
    dateCreated: string;
}

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productId: string, priceCents: number) => void;
    product?: Product;
}

const EditProductModal = ({
    isOpen,
    onClose,
    onSave,
    product,
}: EditProductModalProps) => {
    const [price, setPrice] = useState(
        product ? (product.priceCents / 100).toFixed(2) : ''
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!price || parseFloat(price) <= 0) {
            alert('Please enter a valid price');
            return;
        }

        const priceCents = Math.round(parseFloat(price) * 100);
        onSave(product!.id, priceCents);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit: {product?.name}</h2>
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* <FormControl fullWidth sx={{ mb: 2 }}>
                        <label>Current Price: ${(product?.priceCents || 0) / 100}</label>
                    </FormControl> */}
                    <label>
                        New Price:
                    <input            
                        type="number"
                        placeholder="New Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        step="0.01"
                        min="0"
                    />
                    </label>
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;