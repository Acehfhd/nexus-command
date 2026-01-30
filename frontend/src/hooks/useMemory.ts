import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8090';


export interface MemorySession {
    id: string;
    name: string;
    created_at: string;
    message_count: number;
}

export function useMemory() {
    const [sessions, setSessions] = useState<MemorySession[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMemories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/chat/sessions`);
            if (!res.ok) throw new Error('Failed to fetch sessions');
            const data = await res.json();
            setSessions(data.sessions || []);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            console.error('Failed to fetch memories:', errorMsg);
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMemories();
        const interval = setInterval(fetchMemories, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchMemories]);

    return {
        sessions,
        isLoading,
        error,
        refresh: fetchMemories
    };
}

