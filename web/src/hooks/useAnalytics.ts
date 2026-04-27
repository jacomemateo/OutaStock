import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys, type AnalyticsRange } from '@/lib/queryKeys';
import {
    fetchHeatmap,
    fetchInventoryHealth,
    fetchRevenue,
    fetchTopProducts,
} from '@/services/analyticsApi';

export function analyticsRevenueQueryOptions(token: string, range: AnalyticsRange) {
    return queryOptions({
        queryKey: queryKeys.analytics.revenue(range),
        queryFn: () => fetchRevenue(token, range),
    });
}

export function analyticsTopProductsQueryOptions(
    token: string,
    range: AnalyticsRange,
) {
    return queryOptions({
        queryKey: queryKeys.analytics.topProducts(range),
        queryFn: () => fetchTopProducts(token, range),
    });
}

export function analyticsInventoryHealthQueryOptions(token: string) {
    return queryOptions({
        queryKey: queryKeys.analytics.inventoryHealth(),
        queryFn: () => fetchInventoryHealth(token),
    });
}

export function analyticsHeatmapQueryOptions(token: string) {
    return queryOptions({
        queryKey: queryKeys.analytics.heatmap(),
        queryFn: () => fetchHeatmap(token),
    });
}

export function useAnalytics(range: AnalyticsRange, token: string | null) {
    const enabled = Boolean(token);
    const safeToken = token ?? '';

    const revenueQuery = useQuery({
        ...analyticsRevenueQueryOptions(safeToken, range),
        enabled,
    });
    const topProductsQuery = useQuery({
        ...analyticsTopProductsQueryOptions(safeToken, range),
        enabled,
    });
    const inventoryHealthQuery = useQuery({
        ...analyticsInventoryHealthQueryOptions(safeToken),
        enabled,
    });
    const heatmapQuery = useQuery({
        ...analyticsHeatmapQueryOptions(safeToken),
        enabled,
    });

    return {
        revenueData: revenueQuery.data ?? [],
        topProducts: topProductsQuery.data ?? [],
        inventoryHealth: inventoryHealthQuery.data ?? null,
        heatmapData: heatmapQuery.data ?? [],
        isPending:
            revenueQuery.isPending ||
            topProductsQuery.isPending ||
            inventoryHealthQuery.isPending ||
            heatmapQuery.isPending,
        isFetching:
            revenueQuery.isFetching ||
            topProductsQuery.isFetching ||
            inventoryHealthQuery.isFetching ||
            heatmapQuery.isFetching,
        error:
            revenueQuery.error ??
            topProductsQuery.error ??
            inventoryHealthQuery.error ??
            heatmapQuery.error ??
            null,
    };
}
