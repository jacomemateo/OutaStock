interface ChartTooltipEntry {
    color?: string;
    dataKey?: string | number;
    name?: string;
    value?: number | string | null;
    payload?: {
        avgDailyVelocity?: number;
        productName?: string;
        slotId?: string;
        tooltipLabel?: string;
    };
}

interface ChartTooltipProps {
    active?: boolean;
    label?: string;
    payload?: ChartTooltipEntry[];
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatMoneyFromCents(value: number) {
    return currencyFormatter.format(value / 100);
}

function shouldFormatAsMoney(entry: ChartTooltipEntry) {
    const name = entry.name?.toLowerCase() ?? '';
    const dataKey = String(entry.dataKey ?? '').toLowerCase();

    return (
        name.includes('cents') ||
        dataKey.includes('cents') ||
        name.includes('revenue') ||
        name.includes('profit') ||
        dataKey.includes('revenue') ||
        dataKey.includes('profit')
    );
}

function formatEntryValue(entry: ChartTooltipEntry) {
    if (typeof entry.value !== 'number') {
        return entry.value ?? '—';
    }

    if (shouldFormatAsMoney(entry)) {
        return formatMoneyFromCents(entry.value);
    }

    return entry.value;
}

const ChartTooltip = ({ active, label, payload }: ChartTooltipProps) => {
    if (!active || !payload?.length) {
        return null;
    }

    const firstEntryPayload = payload[0]?.payload;
    const resolvedLabel =
        firstEntryPayload?.tooltipLabel || firstEntryPayload?.productName || label || 'Details';

    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-label">{resolvedLabel}</p>
            {firstEntryPayload?.slotId && firstEntryPayload.slotId !== resolvedLabel ? (
                <p className="chart-tooltip-row">Slot: {firstEntryPayload.slotId}</p>
            ) : null}
            {payload.map((entry, index) => (
                <p className="chart-tooltip-row" key={`${entry.name ?? 'value'}-${index}`}>
                    <span style={{ color: entry.color ?? 'var(--text-secondary)' }}>
                        ● {entry.name}: {formatEntryValue(entry)}
                    </span>
                </p>
            ))}
            {typeof firstEntryPayload?.avgDailyVelocity === 'number' ? (
                <p className="chart-tooltip-row">
                    <span>
                        Avg Daily Velocity: {firstEntryPayload.avgDailyVelocity.toFixed(2)}/day
                    </span>
                </p>
            ) : null}
        </div>
    );
};

export default ChartTooltip;
