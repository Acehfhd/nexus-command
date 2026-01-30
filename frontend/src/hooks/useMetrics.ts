import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8090';

interface GpuMetrics {
    available: boolean;
    vendor: string;
    vram_total_gb: number;
    vram_used_gb: number;
    vram_percent: number;
    temperature_c: number;
    usage_percent: number;
}

interface CpuMetrics {
    usage_percent: number;
    cores: number;
}

interface MemoryMetrics {
    total_gb: number;
    used_gb: number;
    available_gb: number;
    percent: number;
}

interface UptimeMetrics {
    seconds: number;
    formatted: string;
    days: number;
}

export interface SystemMetrics {
    gpu: GpuMetrics;
    cpu: CpuMetrics;
    memory: MemoryMetrics;
    uptime: UptimeMetrics;
}

export function useMetrics(pollingInterval = 5000) {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMetrics = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/metrics`);
            if (!response.ok) throw new Error('Failed to fetch metrics');
            const data = await response.json();
            setMetrics(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, pollingInterval);
        return () => clearInterval(interval);
    }, [fetchMetrics, pollingInterval]);

    return { metrics, error, loading, refresh: fetchMetrics };
}

export default useMetrics;
