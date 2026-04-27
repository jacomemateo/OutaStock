import { useState } from 'react';
import '@styles/Modals/AddProductModal.css';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, costCents: number, priceCents: number) => void;
}

function parseCurrencyToCents(value: string) {
    return Math.round(parseFloat(value) * 100);
}

const AddProductModal = ({ isOpen, onClose, onSave }: AddProductModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        costCents: '',
        priceCents: '',
    });

    const resetForm = () => {
        setFormData({
            name: '',
            costCents: '',
            priceCents: '',
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const name = formData.name.trim();
        const costCents = parseCurrencyToCents(formData.costCents);
        const priceCents = parseCurrencyToCents(formData.priceCents);

        if (!name || Number.isNaN(costCents) || Number.isNaN(priceCents)) {
            return;
        }

        onSave(
            name,
            costCents,
            priceCents,
        );

        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Product</h2>
                    <button className="modal-close" onClick={handleClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <label>
                        Product Name:
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </label>

                    <label>
                        Cost:
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={formData.costCents}
                            placeholder="e.g. 0.75"
                            onChange={(e) =>
                                setFormData({ ...formData, costCents: e.target.value })
                            }
                            required
                        />
                    </label>

                    <label>
                        Price:
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={formData.priceCents}
                            placeholder="e.g. 1.50"
                            onChange={(e) =>
                                setFormData({ ...formData, priceCents: e.target.value })
                            }
                            required
                        />
                    </label>

                    <button type="submit">Add Product</button>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
