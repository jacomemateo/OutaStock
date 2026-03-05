import "@styles/Inventory.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";
import EditInventoryModal from "@/components/EditInventoryModal";
import { fetchInventory, unassignProductFromSlot, getAllProducts } from "@/services/api";
import  ConfirmationModal from "@/components/ConfirmationModal";
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
  const [_, setInventory] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<string[]>([]);


  // Confirmation modal state
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);

  // Fetch inventory from the backend API
  const loadInventory = async () => {
    try {
      const data = await fetchInventory();
      setProducts(data || []); // default to empty array if backend returns null
      console.log("Products data:", data);

      // Make array of all product names (for dropdown)
      const productNames = (data || []).map((p: ProductSlot) => p.productName);
      setInventory(productNames);
    } catch (error) {
      console.error("Failed to load inventory");
    }
  };

  const loadAllProducts = async () => {
    try{
      const data = await getAllProducts();
      const productNames = data.map((p: { name: string }) => p.name);
      setAllProducts(productNames);
      console.log("All products data:", productNames);
    } catch (error) {
      console.error("Failed to load all products");
    }
  }

  useEffect(() => {
    loadInventory();
    loadAllProducts();
  }, []);

  // Slot currently being edited
  const editingSlotInfo = products.find(
    (slot) => slot.slotId === editingSlotID,
  );

  // Handle save from modal
  const handleSave = (
    slotId: number,
    productName: string,
    quantity: number,
  ) => {
    setProducts(
      products.map((p) =>
        p.slotId === slotId ? { ...p, productName, quantity } : p,
      ),
    );
    setEditingSlotID(null);
  };

  // Handle remove product
  const handleRemove = async (slotId: number) => {
    try {
      await unassignProductFromSlot(slotId);
      setProducts(
        products.map((p) =>
          p.slotId === slotId
            ? {
                ...p,
                productName: "",
                quantity: 0,
                productId: "",
                priceCents: 0,
                dateAdded: null,
              }
            : p,
        ),
      );
    } catch (error) {
      console.error(`Failed to remove product from slot ${slotId}:`, error);
    }
  };

  const handleDeleteConfirm = (confirmed: boolean) => {
    if (confirmed && slotToDelete !== null) {
      handleRemove(slotToDelete);
    }
    setConfirmationOpen(false);
    setSlotToDelete(null);
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
  {products.map((product, index) => {
    const isEmpty = !product.productId;

    return (
      <tr
        key={product.slotId}
        className="product-row"
        style={{ "--row-index": index } as React.CSSProperties}
      >
        <td>{product.slotLabel}</td>

        <td className={isEmpty ? "no-product" : ""}>
          {isEmpty ? "NO PRODUCT" : product.productName}
        </td>

        <td>{isEmpty ? "" : product.quantity}</td>


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
                          onClick={() => {
                            setSlotToDelete(product.slotId);
                            setConfirmationOpen(true);
                          }}
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
          inventory={allProducts}
          slotID={editingSlotInfo.slotId}
          slotLabel={editingSlotInfo.slotLabel}
          currentProductName={editingSlotInfo.productName}
          currentQuantity={editingSlotInfo.quantity}
        />
      )}

      {/* Confirmation modal for deletion */}
      {confirmationOpen && (
        <ConfirmationModal
          isOpen={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Are you sure?"
          message="This action cannot be undone. Please confirm if you want to proceed."
        />
      )}
    </div>
  );
};

export default Inventory;
