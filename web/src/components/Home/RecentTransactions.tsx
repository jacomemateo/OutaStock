import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { fetchTransactions, getTransactionCount } from '@/services/api';
import '@styles/Home/RecentTransactions.css';

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

    const [itemsPerPage, setItemsPerPage] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const probeRef = useRef<HTMLDivElement>(null);

    const MAX_PAGES = 1;
    const gap = 16;

    // -----------------------------
    // FIX 1: ResizeObserver (still useful)
    // -----------------------------
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const calculateSpace = () => {
            const containerHeight = containerRef.current?.clientHeight || 0;

            const firstCard = containerRef.current?.querySelector(
                '.transaction-card',
            ) as HTMLElement;

            const itemHeight =
                firstCard?.offsetHeight || probeRef.current?.offsetHeight || 70;

            if (containerHeight > 0 && itemHeight > 0) {
                const fitCount = Math.floor((containerHeight - gap) / (itemHeight + gap));

                setItemsPerPage(Math.max(1, fitCount));
            }
        };

        const observer = new ResizeObserver(() => {
            calculateSpace();
        });

        observer.observe(containerRef.current);
        calculateSpace();

        return () => observer.disconnect();
    }, []);

    // -----------------------------
    // FIX 2: IMPORTANT — recalc AFTER transactions render
    // -----------------------------
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        requestAnimationFrame(() => {
            const containerHeight = containerRef.current?.clientHeight || 0;

            const firstCard = containerRef.current?.querySelector(
                '.transaction-card',
            ) as HTMLElement;

            const itemHeight =
                firstCard?.offsetHeight || probeRef.current?.offsetHeight || 70;

            if (containerHeight > 0 && itemHeight > 0) {
                const fitCount = Math.floor((containerHeight - gap) / (itemHeight + gap));

                setItemsPerPage(Math.max(1, fitCount));
            }
        });
    }, [transactions.length]);

    // -----------------------------
    // DATA LOADING
    // -----------------------------
    const loadData = async () => {
        if (itemsPerPage === 0) return;

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
        if (itemsPerPage === 0) return;

        loadData();
        const interval = setInterval(loadData, 10000);

        return () => clearInterval(interval);
    }, [currentPage, itemsPerPage]);

    // -----------------------------
    // PAGINATION
    // -----------------------------
    const actualTotalPages = itemsPerPage > 0 ? Math.ceil(totalItems / itemsPerPage) : 1;

    const totalPages = Math.min(actualTotalPages, MAX_PAGES) || 1;

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // -----------------------------
    // RENDER
    // -----------------------------
    return (
        <div
            className="page-card"
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <div className="card-header">
                <div>
                    <h2>Recent Transactions</h2>
                    <p className="card-subtitle">Latest sales activity</p>
                </div>
            </div>

            <div
                ref={containerRef}
                className={`transaction-list ${isLoading ? 'loading-opacity' : ''}`}
                style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
            >
                {/* Probe */}
                {transactions.length === 0 && (
                    <div
                        ref={probeRef}
                        className="transaction-card"
                        style={{
                            visibility: 'hidden',
                            position: 'absolute',
                            width: '100%',
                        }}
                    >
                        <div className="transaction-content">
                            <div className="transaction-info">
                                <h3 className="product-name">Probe</h3>
                            </div>
                        </div>
                    </div>
                )}

                {transactions.map((transaction, index) => (
                    <div
                        key={transaction.id}
                        className="transaction-card"
                        style={{ '--card-index': index } as React.CSSProperties}
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
{/* 
            <div className="pagination">
                <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage((p) => p - 1)}
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
            </div> */}
        </div>
    );
};

export default RecentTransactions;
