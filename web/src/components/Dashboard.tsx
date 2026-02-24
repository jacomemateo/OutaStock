import "@styles/Dashboard.css";
import RecentTransactions from "@components/RecentTransactions";
import CurrentInventory from "@components/CurrentInventory";

const DashBoard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">

        {/* Transaction History Box */}
        <RecentTransactions />

        {/* Current Inventory Box */}
        <CurrentInventory />

      </div>
    </div>
  );
};

export default DashBoard;