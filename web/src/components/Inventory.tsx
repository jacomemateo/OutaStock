import "@styles/Inventory.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from "react";
import EditInventoryModal from "@/components/EditInventoryModal";
import { fetchInventory, unassignProductFromSlot } from "@/services/api";

interface ProductSlot {
  slotId: number;
  slotLabel: string;
  quantity: number;
  productName: string;
  priceCents: number;
  productId: string;
  dateAdded: string | null;
}

const Inventory = () => {
  const [editingSlotID, setEditingSlotID] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductSlot[]>([]);
  const [allProducts, setAllProducts] = useState<string[]>([]);

  // Fetch products from the backend API
  const loadProducts = async () => {
    try {
      const data = await fetchInventory();
      setProducts(data || []); // default to empty array if backend returns null
      console.log("Products data:", data);

      // Make array of all product names (for dropdown)
      const productNames = (data || []).map((p) => p.productName);
      setAllProducts(productNames);
    } catch (error) {
      console.error("Failed to load products");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Slot currently being edited
  const editingSlotInfo = products.find((slot) => slot.slotId === editingSlotID);

  // Handle save from modal
  const handleSave = (slotId: number, productName: string, quantity: number) => {
    setProducts(products.map(p =>
      p.slotId === slotId
        ? { ...p, productName, quantity }
        : p
    ));
    setEditingSlotID(null);
  };

  // Handle remove product
  const handleRemove = async (slotId: number) => {
    try {
      await unassignProductFromSlot(slotId);
      setProducts(products.map(p =>
        p.slotId === slotId
          ? { ...p, productName: "", quantity: 0, productId: "", priceCents: 0, dateAdded: null }
          : p
      ));
    } catch (error) {
      console.error(`Failed to remove product from slot ${slotId}:`, error);
    }
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
              {products.map((product) => {
                const isEmpty = !product.productId; // slot has no product

                return (
                  <tr key={product.slotId}>
                    {/* Slot label stays normal */}
                    <td>{product.slotLabel}</td>

                    {/* Product name: show "NO PRODUCT" in bold red if empty */}
                    <td className={isEmpty ? "no-product" : ""}>
                      {isEmpty ? "NO PRODUCT" : product.productName}
                    </td>

                    {/* Quantity: show empty string if slot is empty */}
                    <td
                    >
                      {isEmpty ? "" : product.quantity}
                    </td>

                                {/* Actions */}
                      {isEditMode && (
                        <td className="edit-btn-cell">
                          <div className="action-btns">
                            <button
                              className="edit-btn-row"
                              onClick={() => setEditingSlotID(product.slotId)}
                            >
                              <EditIcon sx={{ fontSize: 20 }} />
                            </button>
                            <button
                              className="delete-btn-row"
                              onClick={() => handleRemove(product.slotId)}
                            >
                              <DeleteIcon sx={{ fontSize: 20 }} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
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