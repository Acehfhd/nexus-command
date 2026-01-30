import { useState, useCallback, useEffect } from 'react';

const API_BASE = 'http://localhost:8090';

export interface HealthStatus {
    services: {
        [key: string]: 'online' | 'offline' | 'error';
    };
    timestamp: number;
}

export function useHealth(intervalMs: number = 10000) {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHealth = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/health`);
            if (!response.ok) throw new Error('Health check failed');
            const data = await response.json();
            setHealth(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown health error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, intervalMs);
        return () => clearInterval(interval);
    }, [fetchHealth, intervalMs]);

    return { health, loading, error, refresh: fetchHealth };
}
