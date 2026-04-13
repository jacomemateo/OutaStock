import { useState } from 'react';

interface Product {
    id: string;
    name: string;
    priceCents: number;
    costCents: number;
    dateCreated: string;
}

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productId: string, costCents: number, priceCents: number) => void;
    product?: Product;
}

const EditProductModal = ({
    isOpen,
    onClose,
    onSave,
    product,
}: EditProductModalProps) => {
    const [price, setPrice] = useState(
        product ? (product.priceCents / 100).toFixed(2) : '',
    );

    const [cost, setCost] = useState(
        product ? (product.costCents / 100).toFixed(2) : '',
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!price || parseFloat(price) <= 0) {
            alert('Please enter a valid price');
            return;
        }

        if (!cost || parseFloat(cost) < 0) {
            alert('Please enter a valid cost');
            return;
        }

        const priceCents = Math.round(parseFloat(price) * 100);
        const costCents = Math.round(parseFloat(cost) * 100);

        onSave(product!.id, costCents, priceCents);
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
                    <label>
                        Cost:
                        <input
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            step="0.01"
                            min="0"
                        />
                    </label>

                    <label>
                        Price:
                        <input
                            type="number"
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