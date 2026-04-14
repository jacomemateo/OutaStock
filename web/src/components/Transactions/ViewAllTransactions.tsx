import '@styles/Transactions/ViewAllTransactions.css';
import { useState, useEffect } from 'react';
import { fetchTransactions, getTransactionCount } from '@/services/api';

type Transaction = {
    id: string;
    productName: string;
    priceAtSaleCents: number;
    dateSold: string;
};

type SortColumn = 'product' | 'date' | 'price';
type SortDirection = 'asc' | 'desc';

const ViewAllTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [sortColumn, setSortColumn] = useState<SortColumn>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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

            const data = await fetchTransactions(itemsPerPage, currentPage - 1, {
                sortBy: sortColumn,
                sortDir: sortDirection,
            });
            setTransactions(data);
        } catch (error) {
            console.error('Failed to load transactions', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTransactions();
    }, [currentPage, sortColumn, sortDirection]);

    const handleSort = (column: SortColumn) => {
        if (sortColumn !== column) {
            setSortColumn(column);
            setSortDirection('asc');
        } else {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        }
    };

    const getSortIcon = (column: SortColumn) => {
        if (sortColumn !== column) return '';
        return sortDirection === 'asc' ? ' ▲' : ' ▼';
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

    return (
        <div className="grid-container">
            <div className="view-all-transactions-grid">
                <div className="page-card">
                    <div className="card-header">
                        <div>
                            <h2>Transactions</h2>
                            <p className="card-subtitle">
                                View and manage all transactions
                            </p>
                        </div>
                    </div>

                    <div className={`table-list ${isLoading ? 'loading-opacity' : ''}`}>
                        {transactions.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th
                                            onClick={() => handleSort('product')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Product Name{getSortIcon('product')}
                                        </th>

                                        <th
                                            onClick={() => handleSort('date')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Date & Time{getSortIcon('date')}
                                        </th>

                                        <th
                                            onClick={() => handleSort('price')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Price{getSortIcon('price')}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactions.map((transaction) => {
                                        const dateObj = new Date(transaction.dateSold);

                                        const dateTime = dateObj.toLocaleString([], {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });

                                        return (
                                            <tr key={transaction.id}>
                                                <td>{transaction.productName}</td>

                                                <td>{dateTime}</td>

                                                <td>
                                                    $
                                                    {(
                                                        transaction.priceAtSaleCents / 100
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
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
    );
};

export default ViewAllTransactions;
