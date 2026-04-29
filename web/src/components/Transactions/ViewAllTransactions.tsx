// web/src/comonents/Transactions/ViewAllTransactions
import '@styles/Transactions/ViewAllTransactions.css';
import '@styles/UpdateProducts/UpdateProducts.css';
import '@styles/Utils/Buttons.css';
import '@styles/Utils/TableUtils.css';
import '@styles/Utils/PageLayout.css';

import { useState, type CSSProperties } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import type { TransactionCursor } from '@/services/transactionsApi';

type SortColumn = 'product' | 'date' | 'price';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

const ViewAllTransactions = () => {
    const [cursorStack, setCursorStack] = useState<Array<TransactionCursor | null>>([
        null,
    ]);
    const [stackIndex, setStackIndex] = useState(0);
    const [sortColumn, setSortColumn] = useState<SortColumn>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const currentCursor = cursorStack[stackIndex] ?? null;
    const usesDateKeyset = sortColumn === 'date' && sortDirection === 'desc';

    const transactionsQuery = useTransactions({
        numRows: ITEMS_PER_PAGE,
        pageOffset: stackIndex,
        cursor: usesDateKeyset ? currentCursor : null,
        search: searchQuery,
        sortBy: sortColumn,
        sortDir: sortDirection,
    });

    const transactions = transactionsQuery.data?.items ?? [];
    const isLoading = transactionsQuery.isPending || transactionsQuery.isFetching;

    const hasPrev = stackIndex > 0;
    const hasNext = transactions.length === ITEMS_PER_PAGE;

    const resetCursor = () => {
        setCursorStack([null]);
        setStackIndex(0);
    };

    const handleSort = (column: SortColumn) => {
        resetCursor();
        if (sortColumn !== column) {
            setSortColumn(column);
            setSortDirection('asc');
            return;
        }
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handleNext = () => {
        if (transactions.length === 0) return;

        const last = transactions[transactions.length - 1];
        const newCursor = last.dateSold
            ? { date: last.dateSold, id: last.id }
            : currentCursor;

        setCursorStack((prev) => [...prev.slice(0, stackIndex + 1), newCursor]);
        setStackIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (stackIndex === 0) return;
        setStackIndex((prev) => prev - 1);
    };

    const getSortIcon = (column: SortColumn) => {
        if (sortColumn !== column) return '';
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        resetCursor();
        setSearchQuery(searchInput.trim());
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        resetCursor();
    };

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
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search by product name"
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

                    <div className={`table-list ${isLoading ? 'loading-opacity' : ''}`}>
                        {transactions.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>
                                            <button
                                                className="table-sort-button"
                                                onClick={() => handleSort('product')}
                                            >
                                                Product {getSortIcon('product')}
                                            </button>
                                        </th>

                                        <th>
                                            <button
                                                className="table-sort-button"
                                                onClick={() => handleSort('date')}
                                            >
                                                Date & Time {getSortIcon('date')}
                                            </button>
                                        </th>

                                        <th>
                                            <button
                                                className="table-sort-button"
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

                    {(hasPrev || hasNext) && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                onClick={handlePrev}
                                disabled={!hasPrev || isLoading}
                            >
                                Previous
                            </button>

                            <button
                                className="pagination-btn"
                                onClick={handleNext}
                                disabled={!hasNext || isLoading}
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
