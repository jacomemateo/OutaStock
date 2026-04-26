import '@styles/Transactions/ViewAllTransactions.css';
import '@styles/UpdateProducts/UpdateProducts.css';
import '@styles/Utils/Buttons.css';
import '@styles/Utils/TableUtils.css';
import '@styles/Utils/PageLayout.css';

import { useState, type CSSProperties } from 'react';
import { useTransactions } from '@/hooks/useTransactions';

type SortColumn = 'product' | 'date' | 'price';
type SortDirection = 'asc' | 'desc';

const ViewAllTransactions = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<SortColumn>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const itemsPerPage = 20;
    const transactionsQuery = useTransactions({
        numRows: itemsPerPage,
        pageOffset: currentPage - 1,
        search: searchQuery,
        sortBy: sortColumn,
        sortDir: sortDirection,
    });
    const transactions = transactionsQuery.data?.items ?? [];
    const totalItems = transactionsQuery.data?.total ?? 0;
    const isLoading = transactionsQuery.isPending || transactionsQuery.isFetching;

    const handleSort = (column: SortColumn) => {
        if (sortColumn !== column) {
            setSortColumn(column);
            setSortDirection('asc');
            return;
        }

        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const getSortIcon = (column: SortColumn) => {
        if (sortColumn !== column) return '';
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setCurrentPage(1);
        setSearchQuery(searchInput.trim());
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setCurrentPage(1);
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

                        <div className="table-toolbar">
                            <form
                                className="table-search-form"
                                onSubmit={handleSearchSubmit}
                            >
                                <input
                                    className="table-search-input"
                                    type="search"
                                    value={searchInput}
                                    onChange={(event) =>
                                        setSearchInput(event.target.value)
                                    }
                                    placeholder="Search by product name"
                                    aria-label="Search transactions by product name"
                                />

                                <button
                                    className="table-control-btn"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    Search
                                </button>

                                {(searchInput || searchQuery) && (
                                    <button
                                        className="table-control-btn-secondary"
                                        type="button"
                                        onClick={handleClearSearch}
                                        disabled={isLoading}
                                    >
                                        Clear
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    <div
                        className={`table-list ${isLoading ? 'loading-opacity' : ''}`}
                    >
                        {transactions.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="col-product">
                                            <button
                                                className="table-sort-button"
                                                type="button"
                                                onClick={() => handleSort('product')}
                                            >
                                                Product {getSortIcon('product')}
                                            </button>
                                        </th>

                                        <th className="col-cost">
                                            <button
                                                className="table-sort-button"
                                                type="button"
                                                onClick={() => handleSort('date')}
                                            >
                                                Date & Time {getSortIcon('date')}
                                            </button>
                                        </th>

                                        <th className="col-price">
                                            <button
                                                className="table-sort-button"
                                                type="button"
                                                onClick={() => handleSort('price')}
                                            >
                                                Price {getSortIcon('price')}
                                            </button>
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactions.map((transaction, index) => {
                                        const dateObj = new Date(
                                            transaction.dateSold ?? '',
                                        );

                                        const dateTime = dateObj.toLocaleString([], {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });

                                        return (
                                            <tr
                                                key={transaction.id}
                                                style={
                                                    {
                                                        '--row-index': index,
                                                    } as CSSProperties
                                                }
                                            >
                                                <td>{transaction.productName}</td>

                                                <td>{dateTime}</td>

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
                                    setCurrentPage((page) => Math.max(1, page - 1))
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
                                onClick={() => setCurrentPage((page) => page + 1)}
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
