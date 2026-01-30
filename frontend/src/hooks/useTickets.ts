import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8090';

export interface IncidentTicket {
    id: string;
    source: string;
    severity: 'critical' | 'warning' | 'info';
    status: 'open' | 'investigating' | 'resolved';
    description: string;
    created_at: string;
    updated_at: string;
}

export function useTickets() {
    const [tickets, setTickets] = useState<IncidentTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTickets = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/tickets`);
            if (!response.ok) throw new Error('Tickets API unavailable');
            const data = await response.json();
            setTickets(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTicket = async (id: string, updates: { status?: string; severity?: string }) => {
        try {
            const response = await fetch(`${API_BASE}/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (response.ok) {
                fetchTickets();
            }
        } catch (err) {
            console.error('Failed to update ticket:', err);
        }
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [fetchTickets]);

    return { tickets, loading, error, refresh: fetchTickets, updateTicket };
}
