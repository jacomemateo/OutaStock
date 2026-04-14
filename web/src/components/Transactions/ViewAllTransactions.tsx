import '@styles/Transactions/ViewAllTransactions.css';
import { useState, useEffect } from 'react';
import { fetchTransactions, getTransactionCount } from '@/services/api';

type Transaction = {
    id: string;
    productName: string;
    priceAtSaleCents: number;
    dateSold: string;
};

const ViewAllTransactions = () => {
    const sortedByOptions = ['Product', 'Time', 'Date', 'Price'];
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('Date');

    const itemsPerPage = 20;

    const loadTransactions = async () => {
        setIsLoading(true);
        try {
            const countData = await getTransactionCount();
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
        loadTransactions();
    }, [currentPage]);

    const sortTransactions = (data: Transaction[]): Transaction[] => {
        const sorted = [...data];
        switch (sortBy) {
            case 'Product':
                return sorted.sort((a, b) => a.productName.localeCompare(b.productName));
            case 'Date':
                return sorted.sort(
                    (a, b) =>
                        new Date(b.dateSold).getTime() - new Date(a.dateSold).getTime(),
                );
            case 'Time':
                return sorted.sort((a, b) => {
                    const timeA = new Date(a.dateSold).getTime();
                    const timeB = new Date(b.dateSold).getTime();
                    return timeB - timeA;
                });
            case 'Price':
                return sorted.sort((a, b) => b.priceAtSaleCents - a.priceAtSaleCents);
            default:
                return sorted;
        }
    };

    const sortedTransactions = sortTransactions(transactions);
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    return (
        <>
            <div className="grid-container">
                <div className="view-all-transactions-grid">
                    <div className="sorted-by">
                        <span>Sorted by:</span>
                        <select
                            className="sorted-by-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            {sortedByOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="page-card">
                        <div className="card-header">
                            <div>
                                <h2>Transactions</h2>
                                <p className="card-subtitle">
                                    View and manage all transactions
                                </p>
                            </div>
                        </div>

                        <div
                            className={`table-list ${isLoading ? 'loading-opacity' : ''}`}
                        >
                            {sortedTransactions.length > 0 ? (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedTransactions.map((transaction) => {
                                            const dateObj = new Date(
                                                transaction.dateSold,
                                            );
                                            const date = dateObj.toLocaleDateString();
                                            const time = dateObj.toLocaleTimeString();

                                            return (
                                                <tr key={transaction.id}>
                                                    <td>{transaction.productName}</td>
                                                    <td>{date}</td>
                                                    <td>{time}</td>
                                                    <td>
                                                        $
                                                        {(
                                                            transaction.priceAtSaleCents /
                                                            100
                                                        ).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-transactions">No transactions found</p>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="pagination-btn"
                                    onClick={() =>
                                        setCurrentPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={currentPage === 1 || isLoading}
                                >
                                    Previous
                                </button>

                                <span className="pagination-info">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    className="pagination-btn"
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                    disabled={currentPage === totalPages || isLoading}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ViewAllTransactions;
