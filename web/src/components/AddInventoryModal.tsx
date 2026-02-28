import {useState} from "react"
import "@styles/AddInventoryModal.css";

interface AddInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddProduct: (productName: string, quantity: number, location: string, price: number) => void;
}

const AddInventoryModal = ({ isOpen, onClose, onAddProduct }: AddInventoryModalProps) => {
    const [formData, setFormData] = useState({
        productName: "",
        quantity: "",
        location: "",
        price: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.productName.trim()) {
            // When submitting make the quantity and price numbers instead of strings   
            onAddProduct(formData.productName, parseInt(formData.quantity) || 0, formData.location, parseFloat(formData.price) || 0)
            setFormData({ productName: "", quantity: "", location: "", price: "" })
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Product</h2>
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
                    <input
                        type="text"
                        placeholder="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    <input
                        type="number"
                        placeholder="Price"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                    <button type="submit">Add Product</button>
                </form>
            </div>
        </div>
    )
}

export default AddInventoryModal;