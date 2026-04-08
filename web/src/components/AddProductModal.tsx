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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Product</h2>
                    <button className="modal-close" onClick={onClose}>
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
                        Price:
                        <input
                            type="text"
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
