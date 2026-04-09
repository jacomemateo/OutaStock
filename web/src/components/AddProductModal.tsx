import { useState } from 'react';
import '@styles/AddProductModal.css';

interface AddProoductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, priceCents: number) => void;
}

const AddProductModal = ({ isOpen, onClose, onSave }: AddProoductModalProps) => {
    const [formData, setFormData] = useState({
        name: '',
        priceCents: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, priceCents } = formData;
        onSave(name, Math.round(parseFloat(priceCents) * 100));
        setFormData({ name: '', priceCents: '' }); // Reset form
        onClose(); // Close modal after saving
    };

    if (!isOpen) return null;

    return (
        <div className="product-modal-overlay" onClick={onClose}>
            <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="product-modal-header">
                    <h2>Add New Product</h2>
                    <button className="product-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form className="product-modal-form" onSubmit={handleSubmit}>
                    <label className="product-modal-field">
                        Product Name:
                        <input
                            className="product-modal-input"
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                    </label>

                    <label className="product-modal-field">
                        Price:
                        <input
                            className="product-modal-input"
                            type="text"
                            value={formData.priceCents}
                            placeholder="e.g. 1.50"
                            onChange={(e) =>
                                setFormData({ ...formData, priceCents: e.target.value })
                            }
                            required
                        />
                    </label>

                    <button className="product-modal-submit" type="submit">
                        Add Product
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
