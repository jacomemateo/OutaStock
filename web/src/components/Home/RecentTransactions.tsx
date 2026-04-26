import { useState, useRef, useLayoutEffect, type CSSProperties } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import '@styles/Home/RecentTransactions.css';

const RecentTransactions = () => {
    const [itemsPerPage, setItemsPerPage] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const probeRef = useRef<HTMLDivElement>(null);

    const gap = 16;
    const transactionsQuery = useTransactions(
        {
            numRows: Math.max(itemsPerPage, 1),
            pageOffset: 0,
            sortBy: 'date',
            sortDir: 'desc',
        },
        {
            enabled: itemsPerPage > 0,
            includeCount: false,
        },
    );
    const transactions = transactionsQuery.data?.items ?? [];

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

    const isLoading = itemsPerPage > 0 && (transactionsQuery.isPending || transactionsQuery.isFetching);

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
                        style={{ '--card-index': index } as CSSProperties}
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
                                        {transaction.dateSold
                                            ? new Date(
                                                  transaction.dateSold,
                                              ).toLocaleString()
                                            : 'Date unavailable'}
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
        </div>
    );
};

export default RecentTransactions;
