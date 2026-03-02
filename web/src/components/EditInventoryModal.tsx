import {useState} from "react"
import "@styles/EditInventoryModal.css";

interface EditInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: (productName: string, quantity: number) => void;
}

const EditInventoryModal = ({ isOpen, onClose, onEdit }: EditInventoryModalProps) => {
    const [formData, setFormData] = useState({
        productName: "",
        quantity: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.productName.trim()) {
            // When submitting make the quantity a number instead of a string   
            onEdit(formData.productName, parseInt(formData.quantity) || 0)
            setFormData({ productName: "", quantity: "" })
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Product name"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    )
}

export default EditInventoryModal;