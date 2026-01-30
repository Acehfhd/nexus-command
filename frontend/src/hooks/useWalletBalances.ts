import { useState, useEffect, useCallback } from 'react';

export type ChainType = 'sol' | 'eth' | 'btc';

export interface WalletEntry {
    id: string;
    chain: ChainType;
    address: string;
    label?: string;
}

export interface WalletBalance {
    id: string;
    chain: ChainType;
    address: string;
    label?: string;
    balance: number;
    usdValue: number;
}

export interface WalletBalancesResult {
    wallets: WalletBalance[];
    totalUsd: number;
}

const DEFAULT_WALLETS: WalletEntry[] = [
    { id: '1', chain: 'sol', address: 'FVWrHjTRovyU6D8Rfma7L6wEPnJvxGckrWhyZ6f13weR', label: 'Main SOL' },
    { id: '2', chain: 'eth', address: '0x172c623E3B340e32e3961497F3772Cb80AF40b34', label: 'Main ETH' },
    { id: '3', chain: 'btc', address: 'bc1qk78gvuaz4xjvf7qxhdk9rpq64967hdfy5a5jj5', label: 'Main BTC' },
];

// Get wallets from localStorage
export function getWallets(): WalletEntry[] {
    const saved = localStorage.getItem('nexus_wallets');
    if (saved) {
        try { return JSON.parse(saved); } catch { return DEFAULT_WALLETS; }
    }
    return DEFAULT_WALLETS;
}

// Save wallets to localStorage
export function saveWallets(wallets: WalletEntry[]) {
    localStorage.setItem('nexus_wallets', JSON.stringify(wallets));
}

// Legacy compatibility exports
export interface WalletAddresses { sol: string; eth: string; btc: string; }

export function getWalletAddresses(): WalletAddresses {
    const wallets = getWallets();
    return {
        sol: wallets.find(w => w.chain === 'sol')?.address || '',
        eth: wallets.find(w => w.chain === 'eth')?.address || '',
        btc: wallets.find(w => w.chain === 'btc')?.address || '',
    };
}

export function setWalletAddresses(addresses: WalletAddresses) {
    const wallets = getWallets();
    const updated = wallets.map(w => {
        if (w.chain === 'sol') return { ...w, address: addresses.sol };
        if (w.chain === 'eth') return { ...w, address: addresses.eth };
        if (w.chain === 'btc') return { ...w, address: addresses.btc };
        return w;
    });
    saveWallets(updated);
}

export function useWalletBalances(prices: { bitcoin: { usd: number }; ethereum: { usd: number }; solana: { usd: number } } | null, pollingInterval = 120000) {
    const [balances, setBalances] = useState<WalletBalancesResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [wallets, setWalletsState] = useState<WalletEntry[]>(getWallets());

    const addWallet = useCallback((chain: ChainType, address: string, label?: string) => {
        const newWallet: WalletEntry = { id: Date.now().toString(), chain, address, label };
        const updated = [...wallets, newWallet];
        saveWallets(updated);
        setWalletsState(updated);
    }, [wallets]);

    const removeWallet = useCallback((id: string) => {
        const updated = wallets.filter(w => w.id !== id);
        saveWallets(updated);
        setWalletsState(updated);
    }, [wallets]);

    const updateWallet = useCallback((id: string, updates: Partial<WalletEntry>) => {
        const updated = wallets.map(w => w.id === id ? { ...w, ...updates } : w);
        saveWallets(updated);
        setWalletsState(updated);
    }, [wallets]);

    const fetchBalances = useCallback(async () => {
        if (!prices) return;

        try {
            const results: WalletBalance[] = [];

            for (const wallet of wallets) {
                let balance = 0;
                let usdValue = 0;

                try {
                    const res = await fetch(`http://localhost:8090/balances/${wallet.chain}/${wallet.address}`);
                    if (res.ok) {
                        const data = await res.json();
                        balance = data.balance || 0;
                        const priceKey = wallet.chain === 'btc' ? 'bitcoin' : wallet.chain === 'eth' ? 'ethereum' : 'solana';
                        usdValue = balance * prices[priceKey].usd;
                    }
                } catch (e) {
                    console.warn(`Balance fetch failed for ${wallet.chain}:`, e);
                }

                results.push({ ...wallet, balance, usdValue });
            }

            setBalances({ wallets: results, totalUsd: results.reduce((sum, w) => sum + w.usdValue, 0) });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Balance fetch failed');
        } finally {
            setLoading(false);
        }
    }, [wallets, prices]);

    useEffect(() => {
        if (prices) {
            fetchBalances();
            const interval = setInterval(fetchBalances, pollingInterval);
            return () => clearInterval(interval);
        }
    }, [fetchBalances, pollingInterval, prices]);

    return { balances, wallets, addWallet, removeWallet, updateWallet, error, loading, refresh: fetchBalances };
}

export default useWalletBalances;
