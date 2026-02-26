import { useState } from "react";
import "@styles/RecentTransactions.css";

const RecentTransactions = () => {
  const transactions = [
    { id: 1, product: "Cookie", price: "$5.00", date: "5/12/2025" },
    { id: 2, product: "Chips", price: "$3.50", date: "5/12/2025" },
    { id: 3, product: "Soda", price: "$2.75", date: "5/11/2025" },
    { id: 4, product: "Candy", price: "$1.99", date: "5/11/2025" },
    { id: 5, product: "Water", price: "$1.50", date: "5/10/2025" },
    { id: 6, product: "Coffee", price: "$4.25", date: "5/10/2025" },
    { id: 7, product: "Donut", price: "$2.50", date: "5/09/2025" },
    { id: 8, product: "Juice", price: "$3.00", date: "5/09/2025" },
    { id: 9, product: "Smoothie", price: "$4.50", date: "5/08/2025" },
    { id: 10, product: "Energy Drink", price: "$3.75", date: "5/08/2025" }, 
    { id: 11, product: "Gum", price: "$0.99", date: "5/07/2025" },
    { id: 12, product: "Mints", price: "$1.25", date: "5/07/2025" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h2>Recent Transactions</h2>
        <p className="transactions-subtitle">Latest sales activity</p>
      </div>

      <div className="transaction-list">
        {currentTransactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className="transaction-card"
            style={{ "--card-index": index }}
          >
            <div className="transaction-content">
              <div className="transaction-left">
                <div className="product-icon">
                  {transaction.product.charAt(0)}
                </div>
                <div className="transaction-info">
                  <h3 className="product-name">{transaction.product}</h3>
                  <p className="transaction-date">{transaction.date}</p>
                </div>
              </div>
              <div className="transaction-right">
                <span className="transaction-price">{transaction.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button 
          className="pagination-btn" 
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          className="pagination-btn" 
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RecentTransactions;