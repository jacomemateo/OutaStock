import "@styles/Dashboard.css";
import RecentTransactions from "@components/RecentTransactions";

const DashBoard = () => {
  // Sample transaction data
  const transactions = [
    { id: 1, product: "Cookie", price: "$5.00", date: "5/12/2025" },
    { id: 2, product: "Chips", price: "$3.50", date: "5/12/2025" },
    { id: 3, product: "Soda", price: "$2.75", date: "5/11/2025" },
    { id: 4, product: "Candy", price: "$1.99", date: "5/11/2025" },
    { id: 5, product: "Water", price: "$1.50", date: "5/10/2025" },
    
  ];

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