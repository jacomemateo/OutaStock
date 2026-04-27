import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
    Bar,
    BarChart,
    type BarShapeProps,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    type MouseHandlerDataParam,
    Rectangle,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useAuth } from '@contexts/AuthContext';
import {
    fetchHeatmap,
    fetchInventoryHealth,
    fetchRevenue,
    fetchTopProducts,
    type DailyRevenueRow,
    type HeatmapRow,
    type InventoryHealthResponse,
    type TopProductRow,
} from '@/services/analyticsApi';
import ChartTooltip from '@/components/Analytics/ChartTooltip';
import './Analytics.css';

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

function formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatCurrencyFromCents(value: number) {
    return currencyFormatter.format(value / 100);
}

function slotColor(quantity: number, threshold: number): string {
    if (quantity === 0) {
        return 'var(--error-red)';
    }
    if (quantity <= threshold) {
        return '#f59e0b';
    }
    return 'var(--umbc-gold)';
}

function marginColor(pct: number): string {
    if (pct >= 30) {
        return 'var(--umbc-gold)';
    }
    if (pct >= 15) {
        return '#f59e0b';
    }
    return 'var(--error-red)';
}

function getAverageDailyVelocity(productName: string, topProducts: TopProductRow[], range: 7 | 30 | 90) {
    const product = topProducts.find((item) => item.productName === productName);
    if (!product) {
        return 0;
    }
    return product.unitsSold / range;
}

type InventoryChartRow = NonNullable<InventoryHealthResponse['slots']>[number] & {
    avgDailyVelocity: number;
    tooltipLabel: string;
};

type MarginChartRow = {
    productName: string;
    marginPct: number;
    profitCents: number;
    tooltipLabel: string;
};

const Analytics = () => {
    const { session } = useAuth();
    const svgRef = useRef<SVGSVGElement>(null);

    const [range, setRange] = useState<7 | 30 | 90>(30);
    const [revenueData, setRevenueData] = useState<DailyRevenueRow[]>([]);
    const [topProducts, setTopProducts] = useState<TopProductRow[]>([]);
    const [inventoryHealth, setInventoryHealth] = useState<InventoryHealthResponse | null>(null);
    const [heatmapData, setHeatmapData] = useState<HeatmapRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [topProductsMode, setTopProductsMode] = useState<'units' | 'profit'>('units');
    const [marginMode, setMarginMode] = useState<'percent' | 'absolute'>('percent');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        if (!session) {
            return;
        }

        setLoading(true);
        Promise.all([
            fetchRevenue(session.accessToken, range),
            fetchTopProducts(session.accessToken, range),
            fetchInventoryHealth(session.accessToken),
            fetchHeatmap(session.accessToken),
        ])
            .then(([rev, top, inv, heat]) => {
                setRevenueData(rev);
                setTopProducts(top);
                setInventoryHealth(inv);
                setHeatmapData(heat);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [range, session]);

    useEffect(() => {
        if (selectedDate && !revenueData.some((row) => row.date === selectedDate)) {
            setSelectedDate(null);
        }
    }, [revenueData, selectedDate]);

    useEffect(() => {
        if (!svgRef.current) {
            return;
        }

        const byDate = Object.fromEntries(heatmapData.map((row) => [row.date, row]));
        const today = new Date();
        const dates = Array.from({ length: 28 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (27 - index));
            return date;
        });

        const cellSize = 38;
        const gap = 6;
        const width = 7 * (cellSize + gap) - gap;
        const height = 4 * (cellSize + gap) - gap;
        const maxCount = Math.max(1, ...heatmapData.map((row) => row.transactionCount));
        const computedStyle = getComputedStyle(document.documentElement);
        const theme = document.documentElement.getAttribute('data-theme');
        const baseColor = theme === 'light' ? '#f0f0f0' : '#2a2a2a';
        const accentColor = computedStyle.getPropertyValue('--umbc-gold').trim() || baseColor;

        const colorScale = d3
            .scaleLinear<string>()
            .domain([0, maxCount])
            .range([baseColor, accentColor])
            .interpolate(d3.interpolateRgb);

        const svg = d3
            .select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`);

        svg.selectAll('*').remove();

        dates.forEach((date, index) => {
            const col = index % 7;
            const row = Math.floor(index / 7);
            const dateStr = formatDateKey(date);
            const data = byDate[dateStr];
            const x = col * (cellSize + gap);
            const y = row * (cellSize + gap);

            const cell = svg.append('g');

            cell.append('rect')
                .attr('x', x)
                .attr('y', y)
                .attr('width', cellSize)
                .attr('height', cellSize)
                .attr('rx', 6)
                .attr('fill', data ? colorScale(data.transactionCount) : 'var(--lighter-black)')
                .attr('class', 'heatmap-cell');

            cell.append('title').text(
                data
                    ? `${dateStr}\n${data.transactionCount} transactions\n${formatCurrencyFromCents(data.revenueCents)} revenue`
                    : `${dateStr}\nNo sales`,
            );
        });
    }, [heatmapData]);

    const totalRevenueCents = revenueData.reduce((sum, row) => sum + row.revenueCents, 0);
    const totalProfitCents = revenueData.reduce((sum, row) => sum + row.profitCents, 0);
    const averageMargin =
        totalRevenueCents > 0 ? ((totalProfitCents / totalRevenueCents) * 100).toFixed(1) : null;

    const sortedProducts = [...topProducts].sort((left, right) =>
        topProductsMode === 'units'
            ? right.unitsSold - left.unitsSold
            : right.profitCents - left.profitCents,
    );
    const topProductsChartHeight = Math.max(160, sortedProducts.length * 30);

    const inventorySlots =
        inventoryHealth?.slots.map((slot) => ({
            ...slot,
            avgDailyVelocity: getAverageDailyVelocity(slot.productName, topProducts, range),
            tooltipLabel: slot.productName || slot.slotId,
        })) ?? [];

    const marginData = topProducts
        .map((product) => {
            const slot = inventoryHealth?.slots.find(
                (inventorySlot) => inventorySlot.productName === product.productName,
            );
            const price = slot?.priceCents ?? 0;
            const cost = slot?.costCents ?? 0;
            const marginPct = price > 0 ? ((price - cost) / price) * 100 : 0;

            return {
                productName: product.productName,
                marginPct,
                profitCents: product.profitCents,
                tooltipLabel: product.productName,
            };
        })
        .sort((left, right) =>
            marginMode === 'percent'
                ? right.marginPct - left.marginPct
                : right.profitCents - left.profitCents,
        );
    const marginChartHeight = Math.max(160, marginData.length * 30);

    const renderInventoryBar = (props: BarShapeProps) => {
        const payload = props.payload as InventoryChartRow | undefined;

        if (!payload) {
            return null;
        }

        return (
            <Rectangle
                {...props}
                fill={slotColor(payload.quantity, inventoryHealth?.threshold ?? 0)}
                radius={[4, 4, 0, 0]}
            />
        );
    };

    const renderMarginBar = (props: BarShapeProps) => {
        const payload = props.payload as MarginChartRow | undefined;

        if (!payload) {
            return null;
        }

        return (
            <Rectangle
                {...props}
                fill={marginColor(payload.marginPct)}
                radius={[0, 4, 4, 0]}
            />
        );
    };

    const handleRevenueChartClick = (state: MouseHandlerDataParam) => {
        const nextDate =
            typeof state.activeTooltipIndex === 'number'
                ? revenueData[state.activeTooltipIndex]?.date ?? null
                : typeof state.activeLabel === 'string'
                  ? state.activeLabel
                  : null;

        if (nextDate) {
            setSelectedDate(nextDate);
        }
    };

    if (!session) {
        return (
            <div className="grid-container analytics-grid-container">
                <div className="analytics-page">
                    <div className="analytics-loading">Loading analytics...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid-container analytics-grid-container">
            <div className="analytics-page">
                <div className="analytics-range-selector">
                    {([7, 30, 90] as const).map((days) => (
                        <button
                            key={days}
                            className={
                                range === days
                                    ? 'table-control-btn'
                                    : 'table-control-btn-secondary'
                            }
                            onClick={() => setRange(days)}
                        >
                            {days}D
                        </button>
                    ))}
                </div>

                <div className="metric-grid">
                    <div className="metric-card">
                        <p className="metric-card-title">Total Revenue</p>
                        <p className="metric-card-subtitle">
                            Gross sales across the selected {range} days
                        </p>
                        <p className="metric-card-value">
                            {currencyFormatter.format(totalRevenueCents / 100)}
                        </p>
                    </div>
                    <div className="metric-card">
                        <p className="metric-card-title">Total Profit</p>
                        <p className="metric-card-subtitle">
                            Estimated profit after product costs
                        </p>
                        <p className="metric-card-value">
                            {currencyFormatter.format(totalProfitCents / 100)}
                        </p>
                    </div>
                    <div className="metric-card">
                        <p className="metric-card-title">Avg Margin</p>
                        <p className="metric-card-subtitle">
                            Profit as a share of revenue in this range
                        </p>
                        <p className="metric-card-value">{averageMargin ? `${averageMargin}%` : '—'}</p>
                    </div>
                </div>

                {loading && revenueData.length === 0 && !inventoryHealth ? (
                    <div className="analytics-loading">Loading analytics...</div>
                ) : null}

                <div className="analytics-charts-row analytics-charts-row-1">
                    <div className="page-card chart-card">
                        <div className="card-header">
                            <div>
                                <h2>Revenue &amp; Profit</h2>
                                <p className="card-subtitle">
                                    Daily revenue vs profit - gap is your cost
                                </p>
                            </div>
                        </div>
                        <div className="chart-fixed-region chart-fixed-region-lg">
                            <div className="chart-inner-frame">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueData} onClick={handleRevenueChartClick}>
                                        <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                                        <XAxis dataKey="date" />
                                        <YAxis
                                            tickFormatter={(value: number) =>
                                                compactCurrencyFormatter.format(value / 100)
                                            }
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Legend />
                                        <Line
                                            dataKey="revenueCents"
                                            name="Revenue"
                                            stroke="var(--umbc-gold)"
                                            type="monotone"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            dataKey="profitCents"
                                            name="Profit"
                                            stroke="#4ade80"
                                            type="monotone"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <p className="chart-selected-date">
                            {selectedDate
                                ? `Showing data for ${selectedDate} - click another point to change.`
                                : 'Click a point to inspect a specific day.'}
                        </p>
                    </div>

                    <div className="page-card chart-card">
                        <div className="card-header">
                            <div>
                                <h2>Top Products</h2>
                                <p className="card-subtitle">
                                    Best sellers for the selected range
                                </p>
                            </div>
                            <div className="card-header-actions">
                                <div className="chart-toggle">
                                    <button
                                        className={
                                            topProductsMode === 'units'
                                                ? 'table-control-btn'
                                                : 'table-control-btn-secondary'
                                        }
                                        onClick={() => setTopProductsMode('units')}
                                    >
                                        Units
                                    </button>
                                    <button
                                        className={
                                            topProductsMode === 'profit'
                                                ? 'table-control-btn'
                                                : 'table-control-btn-secondary'
                                        }
                                        onClick={() => setTopProductsMode('profit')}
                                    >
                                        Profit
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="chart-scroll-region">
                            <div
                                className="chart-scroll-canvas"
                                style={{ height: `${topProductsChartHeight}px` }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sortedProducts} layout="vertical">
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="chart-grid"
                                        />
                                        <XAxis
                                            type="number"
                                            tickFormatter={
                                                topProductsMode === 'profit'
                                                    ? (value: number) =>
                                                          compactCurrencyFormatter.format(
                                                              value / 100,
                                                          )
                                                    : undefined
                                            }
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="productName"
                                            width={120}
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar
                                            dataKey={
                                                topProductsMode === 'units'
                                                    ? 'unitsSold'
                                                    : 'profitCents'
                                            }
                                            name={
                                                topProductsMode === 'units'
                                                    ? 'Units Sold'
                                                    : 'Profit'
                                            }
                                            fill="var(--umbc-gold)"
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="page-card chart-card">
                        <div className="card-header">
                            <div>
                                <h2>Inventory Health</h2>
                                <p className="card-subtitle">
                                    Color shows stock status vs. threshold
                                </p>
                            </div>
                        </div>
                        <div className="chart-fixed-region chart-fixed-region-md">
                            <div className="chart-inner-frame">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={inventorySlots}>
                                        <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                                        <XAxis dataKey="slotId" />
                                        <YAxis />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar
                                            dataKey="quantity"
                                            name="Quantity"
                                            shape={renderInventoryBar}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="analytics-charts-row analytics-charts-row-2">
                    <div className="page-card chart-card">
                        <div className="card-header">
                            <div>
                                <h2>Profit Margin by Product</h2>
                                <p className="card-subtitle">
                                    Margin percentage and realized profit
                                </p>
                            </div>
                            <div className="card-header-actions">
                                <div className="chart-toggle">
                                    <button
                                        className={
                                            marginMode === 'percent'
                                                ? 'table-control-btn'
                                                : 'table-control-btn-secondary'
                                        }
                                        onClick={() => setMarginMode('percent')}
                                    >
                                        Percent
                                    </button>
                                    <button
                                        className={
                                            marginMode === 'absolute'
                                                ? 'table-control-btn'
                                                : 'table-control-btn-secondary'
                                        }
                                        onClick={() => setMarginMode('absolute')}
                                    >
                                        Profit
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="chart-scroll-region">
                            <div
                                className="chart-scroll-canvas"
                                style={{ height: `${marginChartHeight}px` }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={marginData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="chart-grid"
                                        />
                                        <XAxis
                                            type="number"
                                            tickFormatter={(value: number) =>
                                                marginMode === 'percent'
                                                    ? `${value.toFixed(0)}%`
                                                    : compactCurrencyFormatter.format(
                                                          value / 100,
                                                      )
                                            }
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="productName"
                                            width={120}
                                        />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar
                                            dataKey={
                                                marginMode === 'percent'
                                                    ? 'marginPct'
                                                    : 'profitCents'
                                            }
                                            name={
                                                marginMode === 'percent'
                                                    ? 'Margin %'
                                                    : 'Profit'
                                            }
                                            shape={renderMarginBar}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="page-card chart-card">
                        <div className="card-header">
                            <div>
                                <h2>Sales Heatmap</h2>
                                <p className="card-subtitle">
                                    Last 28 days - darker = more sales
                                </p>
                            </div>
                        </div>
                        <div className="heatmap-wrapper">
                            <div className="heatmap-day-labels">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <span key={day}>{day}</span>
                                ))}
                            </div>
                            <svg ref={svgRef} />
                            <div className="heatmap-legend">
                                <span>Less</span>
                                <div className="heatmap-legend-bar" />
                                <span>More</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
