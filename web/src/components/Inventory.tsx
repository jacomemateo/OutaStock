import "@styles/Inventory.css";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import AddInventoryModal from "@/components/AddInventoryModal";

interface Product {
  id: string;
  productName: string;
  quantity: number;
  location: string;
  price: number;
}

const Inventory = () => {
  const [FormModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);

  const handleAddProduct = (productName: string, quantity: number, location: string, price: number) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      productName,
      quantity,
      location,
      price
    };
    setProducts([...products, newProduct]);
    console.log("Adding product:", newProduct);
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
        <button className="add-btn" onClick={() => setFormModalOpen(true)}>
          <AddIcon />
        </button>
      </div>

      {/* Product List */}
      <div className="products-list">
        {products.length === 0 ? (
          <p className="empty-state">No products added yet</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Location</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.productName}</td>
                  <td>{product.quantity}</td>
                  <td>{product.location}</td>
                  <td>${product.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddInventoryModal
        isOpen={FormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}; 

export default Inventory;