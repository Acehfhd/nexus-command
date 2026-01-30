import { useState, useEffect, useCallback } from 'react';

// Fear & Greed Index from alternative.me
const FEAR_GREED_API = 'https://api.alternative.me/fng/';

export interface FearGreedData {
    value: number;
    classification: string; // 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed'
    timestamp: string;
}

export function useFearGreed(pollingInterval = 300000) { // 5 min default
    const [data, setData] = useState<FearGreedData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchFearGreed = useCallback(async () => {
        try {
            const response = await fetch(FEAR_GREED_API);
            if (!response.ok) throw new Error('Failed to fetch Fear & Greed');

            const json = await response.json();
            if (json.data && json.data.length > 0) {
                const latest = json.data[0];
                setData({
                    value: parseInt(latest.value, 10),
                    classification: latest.value_classification,
                    timestamp: latest.timestamp,
                });
                setError(null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fear/Greed fetch failed');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFearGreed();
        const interval = setInterval(fetchFearGreed, pollingInterval);
        return () => clearInterval(interval);
    }, [fetchFearGreed, pollingInterval]);

    return { data, error, loading, refresh: fetchFearGreed };
}

export default useFearGreed;
