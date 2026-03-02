import "@styles/Inventory.css";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import AddInventoryModal from "@/components/EditInventoryModal";
import { fetchProducts } from "@/services/api";
import { useEffect } from "react";

// interface Product {
//   id: string;
//   productName: string;
//   quantity: number;
//   location: string;
// }

interface ProductSlot {
  slotId: number;
  quantity: number;
  productName: string;
  priceCents: number;
  productId: string;
  dateAdded: string | null;
}

const Inventory = () => {
  const [editingSlotID, setEditingSlotID] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [formModalOpen, setFormModalOpen] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductSlot[]>(() => {
    // Initialize 16 empty slots
    return Array.from({ length: 16 }, (_, i) => ({
      slotId: i + 1,
      quantity: 0,
      productName: "",
      priceCents: 0,
      productId: "",
      dateAdded: null,
    }));
  });
  const [allProducts, setAllProducts] = useState<string[]>([]);

  // Fetch products from the backend API
  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
      console.log("Products data:", data);

      //Make array of all product names
      const productNames = data.map(
        (productInfo: ProductSlot) => productInfo.productName,
      );
      setAllProducts(productNames);
    } catch (error) {
      console.error("Failed to load products");
    }
  };

  useEffect(() => {
    console.log("All Products", allProducts);
  }, [allProducts]);

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <div>
          <h2>Inventory</h2>
          <p className="inventory-subtitle">
            Products currently in the vending machine
          </p>
        </div>
        <button className="add-btn" onClick= {() => setIsEditMode(!isEditMode)} >
          <EditIcon />
        </button>
      </div>

      <div className="products-list">
        <table className="products-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th> </th>
              
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slotId}>
                <td>{product.slotId}</td>
                <td></td>
                <td></td>
                <td>
                  {isEditMode && (
                    <button className="edit-btn-row" onClick={() => setEditingSlotID(product.slotId)}>
                      <EditIcon sx={{ fontSize: 20 }} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
