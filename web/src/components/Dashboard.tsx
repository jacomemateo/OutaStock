import "@styles/Dashboard.css";
import RecentTransactions from "@components/RecentTransactions";

const DashBoard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">

        {/* Transaction History Box */}
        <RecentTransactions />

      </div>
    </div>
  );
};

export default DashBoard;