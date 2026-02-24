import "@styles/CurrentInventory.css"

const CurrentInventory = () => {
    return(
        <div className="current-inventory-container">
            <div className="current-inventory-header">
                <h2>Current Inventory</h2>
                <p className="current-inventory-subtitle">Products currently in the vending machine</p> 
            </div>
            <div className="current-inventory-list">
                <h1>Add inventory content</h1>
            </div>
        </div>
    )
}

export default CurrentInventory