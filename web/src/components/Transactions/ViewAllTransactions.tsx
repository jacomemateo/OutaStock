// web/src/comonents/Transactions/ViewAllTransactions
import '@styles/Transactions/ViewAllTransactions.css';
import '@styles/UpdateProducts/UpdateProducts.css';
import '@styles/Utils/Buttons.css';
import '@styles/Utils/TableUtils.css';
import '@styles/Utils/PageLayout.css';

import { useEffect, useState, type CSSProperties } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTransactions } from '@/hooks/useTransactions';
import { queryKeys } from '@/lib/queryKeys';
import { fetchTransactions } from '@/services/transactionsApi';

type SortColumn = 'product' | 'date' | 'price';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

const ViewAllTransactions = () => {
    const queryClient = useQueryClient();

    const [currentPage, setCurrentPage] = useState(1);
    const [sortColumn, setSortColumn] = useState<SortColumn>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const transactionsQuery = useTransactions({
        numRows: ITEMS_PER_PAGE,
        pageOffset: currentPage - 1,
        search: searchQuery,
        sortBy: sortColumn,
        sortDir: sortDirection,
    });

    const transactions = transactionsQuery.data?.items ?? [];
    const totalItems = transactionsQuery.data?.total ?? 0;
    const isLoading =
        transactionsQuery.isPending || transactionsQuery.isFetching;

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    /**
     * SMART PREFETCH:
     * Only prefetch currentPage - 1 and currentPage + 1
     * (so max 2 pages worth of extra data)
     */
    useEffect(() => {
        const prefetchPage = async (page: number) => {
            if (page < 1 || page > totalPages) return;

            const params = {
                numRows: ITEMS_PER_PAGE,
                pageOffset: page - 1,
                search: searchQuery,
                sortBy: sortColumn,
                sortDir: sortDirection,
            };

            const queryKey = queryKeys.transactions.list(params);

            // already cached → skip
            const existing = queryClient.getQueryData(queryKey);
            if (existing) return;

            await queryClient.prefetchQuery({
                queryKey,
                queryFn: () => fetchTransactions(params),
                staleTime: 60 * 1000, // 1 min cache freshness
            });
        };

        // prefetch only 2 neighbors
        void prefetchPage(currentPage - 1);
        void prefetchPage(currentPage + 1);
    }, [
        currentPage,
        searchQuery,
        sortColumn,
        sortDirection,
        totalPages,
        queryClient,
    ]);

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
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
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

                    <div
                        className={`table-list ${
                            isLoading ? 'loading-opacity' : ''
                        }`}
                    >
                        {transactions.length > 0 ? (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>
                                            <button
                                                className="table-sort-button"
                                                onClick={() =>
                                                    handleSort('product')
                                                }
                                            >
                                                Product {getSortIcon('product')}
                                            </button>
                                        </th>

                                        <th>
                                            <button
                                                className="table-sort-button"
                                                onClick={() =>
                                                    handleSort('date')
                                                }
                                            >
                                                Date & Time {getSortIcon('date')}
                                            </button>
                                        </th>

                                        <th>
                                            <button
                                                className="table-sort-button"
                                                onClick={() =>
                                                    handleSort('price')
                                                }
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

                                        const dateTime =
                                            dateObj.toLocaleString([], {
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
                                                <td>
                                                    {transaction.productName}
                                                </td>

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
                            <p className="no-transactions">
                                No transactions found
                            </p>
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
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                disabled={
                                    currentPage === totalPages || isLoading
                                }
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