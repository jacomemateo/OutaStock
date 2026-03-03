import "@styles/Inventory.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from "react";
import EditInventoryModal from "@/components/EditInventoryModal";
import { fetchInventory } from "@/services/api";
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
  const [editingSlotID, setEditingSlotID] = useState<number | null>(null); // State to track which slot is being edited
  const [isEditMode, setIsEditMode] = useState<boolean>(false); // State to show the edit button in each row
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
      const data = await fetchInventory();
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

  //Get Slot being edited
  const editingSlotInfo = products.find((slot) => slot.slotId === editingSlotID);
  // console.log("Editing Slot:",  editingSlotInfo);
  const handleSave = (slotId: number, productName: string, quantity: number) => {
    setProducts(products.map(p =>
      p.slotId === slotId
        ? { ...p, productName, quantity }
        : p
    ));
    setEditingSlotID(null); // Close modal after save
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
        <button className="add-btn" onClick={() => setIsEditMode(!isEditMode)}>
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
              {isEditMode && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slotId}>
                <td>{product.slotId}</td>
                <td>{product.productName}</td>
                <td>{product.quantity}</td>
                <td className="edit-btn-cell">
                  {isEditMode && (
                    <div className="action-btns">
                    <button
                      className="edit-btn-row"
                      onClick={() => {
                        console.log("Selected slot:", product.slotId);
                        setEditingSlotID(product.slotId);
                      }}
                    >
                      <EditIcon sx={{ fontSize: 20 }} />
                    </button>

                    <button className="delete-btn-row" onClick={() => {
                      // For now just clear the slot, but eventually we can add a confirmation modal and delete the product from the database
                      setProducts(products.map(p =>
                        p.slotId === product.slotId
                          ? { ...p, productName: "", quantity: 0 }
                          : p
                      ));
                    }}>
                        <DeleteIcon sx={{ fontSize: 20 }} />
                    </button>
                    </div>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingSlotInfo && (
      <EditInventoryModal
        isOpen={editingSlotID !== null}
        onClose={() => setEditingSlotID(null)}
        onSave={handleSave}
        allProducts={allProducts}
        slotID={editingSlotInfo.slotId}
        currentProductName={editingSlotInfo.productName}
        currentQuantity={editingSlotInfo.quantity}
      />
    )}
    </div>

    
  );
};

export default Inventory;
