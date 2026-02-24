import "@styles/RecentTransactions.css";

const RecentTransactions = () => {
  const transactions = [
    { id: 1, product: "Cookie", price: "$5.00", date: "5/12/2025" },
    { id: 2, product: "Chips", price: "$3.50", date: "5/12/2025" },
    { id: 3, product: "Soda", price: "$2.75", date: "5/11/2025" },
    { id: 4, product: "Candy", price: "$1.99", date: "5/11/2025" },
    { id: 5, product: "Water", price: "$1.50", date: "5/10/2025" },
  ];

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h2>Recent Transactions</h2>
        <p className="transactions-subtitle">Latest sales activity</p>
      </div>

      <div className="transaction-list">
        {transactions.map((transaction, index) => (
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
    </div>
  );
};

export default RecentTransactions;