import { useState, useEffect } from 'react';
import { fetchTransactions, getTransactionCount } from '@/services/api';
import '@styles/RecentTransactions.css';

type Transaction = {
    id: string;
    productName: string;
    priceAtSaleCents: number;
    dateSold: string;
};

const RecentTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const itemsPerPage = 5;

    // CHANGE 1: Set your desired page limit here.
    // If the database has 100 items (20 pages), this will cap it at 5 pages.
    const MAX_PAGES = 5;

    const loadData = async () => {
        setIsLoading(true);
        try {
            const countData = await getTransactionCount();

            // CHANGE 2: Fix the type mismatch.
            // Your backend returns a raw number (e.g. 54), not an object { count: 54 }.
            // We check if it's an object or a number to be safe.
            const rawCount =
                typeof countData === 'number' ? countData : (countData as any).count;

            if (rawCount !== undefined) {
                setTotalItems(rawCount);
            }

            const data = await fetchTransactions(itemsPerPage, currentPage - 1);
            setTransactions(data);
        } catch (error) {
            console.error('Failed to load transactions', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, [currentPage]);

    // Calculate total pages based on database count
    const actualTotalPages = Math.ceil(totalItems / itemsPerPage);

    // CHANGE 3: Apply the limit.
    // Display the smaller of (Actual Pages) or (Max Allowed Pages).
    // If actual is 0, default to 1.
    const totalPages = Math.min(actualTotalPages, MAX_PAGES) || 1;

    return (
        <div className="transactions-container">
            <div className="transactions-header">
                <h2>Recent Transactions</h2>
                <p className="transactions-subtitle">Latest sales activity</p>
            </div>

            <div className={`transaction-list ${isLoading ? 'loading-opacity' : ''}`}>
                {transactions.map((transaction) => (
                    <div
                        key={transaction.id}
                        className="transaction-card"
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
                                        {new Date(transaction.dateSold).toLocaleString()}
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
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1 || isLoading}
                >
                    Previous
                </button>

                <span className="pagination-info">
                    {/* This now correctly shows "Page 1 of 5" based on the limit */}
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    // This now correctly stops at the calculated totalPages
                    disabled={currentPage === totalPages || isLoading}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default RecentTransactions;
