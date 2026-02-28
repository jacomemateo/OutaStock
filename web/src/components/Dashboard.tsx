import "@styles/Dashboard.css";
import RecentTransactions from "@components/RecentTransactions";
import Inventory from "@/components/Inventory";

const DashBoard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">

        {/* Transaction History Box */}
        <RecentTransactions />

        {/* Current Inventory Box */}
        <Inventory />

      </div>
    </div>
  );
};

export default DashBoard;