import { useState, useEffect } from "react";
import { fetchRecentTransactions } from "@/services/api";
import "@styles/RecentTransactions.css";

type Transaction = {
  id: string;
  productName: string;
  priceAtSaleCents: number;
  dateSold: string;
};

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadTransactions = async () => {
    try {
      const data = await fetchRecentTransactions(60); //Fetch more than we need for pagination
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions");
    }
  };

  useEffect(() => {
    // Initial fetch
    loadTransactions();

    // Poll every 10 seconds
    const interval = setInterval(() => {
      loadTransactions();
    }, 10000);

    // Cleanup (VERY IMPORTANT)
    return () => clearInterval(interval);
  }, []);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

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
            style={{ "--card-index": index } as React.CSSProperties}
          >
            <div className="transaction-content">
              <div className="transaction-left">
                <div className="product-icon">
                  {transaction.productName.charAt(0)}
                </div>
                <div className="transaction-info">
                  <h3 className="product-name">
                    {transaction.productName}
                  </h3>
                  <p className="transaction-date">
                    {new Date(transaction.dateSold).toLocaleString(undefined, {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="transaction-right">
                <span className="transaction-price">
                  ${(transaction.priceAtSaleCents / 100).toFixed(2)}
                </span>
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
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          className="pagination-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RecentTransactions;