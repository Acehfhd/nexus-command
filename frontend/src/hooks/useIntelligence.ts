import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8090';

export interface IntelligenceEvent {
    id: string;
    type: 'crypto' | 'leads' | 'system' | 'logs';
    level: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: string;
    timestamp_human: string;
}

export interface IntelligenceStats {
    signalsToday: number;
    newLeads: number;
    warnings: number;
    uptime: string;
}

export function useIntelligence(pollingInterval = 10000) {
    const [events, setEvents] = useState<IntelligenceEvent[]>([]);
    const [stats, setStats] = useState<IntelligenceStats>({
        signalsToday: 0,
        newLeads: 0,
        warnings: 0,
        uptime: '99.9%'
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/events?limit=50`);
            if (!response.ok) throw new Error('Events API unavailable');

            const data = await response.json();
            const fetchedEvents: IntelligenceEvent[] = data.events || [];

            setEvents(fetchedEvents);

            // Calculate stats from events
            const warnings = fetchedEvents.filter(e => e.level === 'warning' || e.level === 'error').length;
            const leadsCount = fetchedEvents.filter(e => e.type === 'leads').length;

            // Calculate uptime based on container events
            const containerEvents = fetchedEvents.filter(e => e.id.startsWith('container-'));
            const runningContainers = containerEvents.filter(e => e.level === 'success').length;
            const totalContainers = containerEvents.length || 1;
            const uptimePercent = (runningContainers / totalContainers) * 100;

            setStats({
                signalsToday: fetchedEvents.length,
                newLeads: leadsCount,
                warnings,
                uptime: `${uptimePercent.toFixed(1)}%`
            });

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch events');
        } finally {
            setLoading(false);
        }
    }, []);

    // Post a custom event
    const addEvent = useCallback(async (type: string, level: string, title: string, message: string) => {
        try {
            await fetch(`${API_BASE}/events?event_type=${type}&level=${level}&title=${encodeURIComponent(title)}&message=${encodeURIComponent(message)}`, {
                method: 'POST'
            });
            fetchEvents(); // Refresh
        } catch (err) {
            console.error('Failed to add event:', err);
        }
    }, [fetchEvents]);

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, pollingInterval);
        return () => clearInterval(interval);
    }, [fetchEvents, pollingInterval]);

    return { events, stats, error, loading, refresh: fetchEvents, addEvent };
}


