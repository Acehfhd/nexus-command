import { useState, useEffect, useCallback } from 'react';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface CryptoPrices {
    bitcoin: { usd: number; usd_24h_change: number };
    ethereum: { usd: number; usd_24h_change: number };
    solana: { usd: number; usd_24h_change: number };
}

export function useCryptoPrices(pollingInterval = 60000) {
    const [prices, setPrices] = useState<CryptoPrices | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPrices = useCallback(async () => {
        try {
            // Try backend cache first (from n8n), fallback to direct CoinGecko
            let data: any = null;

            try {
                const backendRes = await fetch('http://localhost:8090/prices');
                if (backendRes.ok) {
                    data = await backendRes.json();
                    if (data && data.bitcoin) {
                        setPrices(data);
                        setError(null);
                        return;
                    }
                }
            } catch {
                // Backend not available, use CoinGecko directly
            }

            // Direct CoinGecko call (free, no API key)
            const response = await fetch(
                `${COINGECKO_API}/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true`
            );

            if (!response.ok) throw new Error('Failed to fetch prices');

            data = await response.json();
            setPrices({
                bitcoin: { usd: data.bitcoin.usd, usd_24h_change: data.bitcoin.usd_24h_change },
                ethereum: { usd: data.ethereum.usd, usd_24h_change: data.ethereum.usd_24h_change },
                solana: { usd: data.solana.usd, usd_24h_change: data.solana.usd_24h_change },
            });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Price fetch failed');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, pollingInterval);
        return () => clearInterval(interval);
    }, [fetchPrices, pollingInterval]);

    return { prices, error, loading, refresh: fetchPrices };
}

export default useCryptoPrices;
