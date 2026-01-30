import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8090';

export interface Container {
    name: string;
    status: string;
    is_running: boolean;
    ports: string;
    image: string;
}

export interface ContainersResponse {
    containers: Container[];
    total: number;
}

export function useContainers(pollingInterval = 10000) {
    const [containers, setContainers] = useState<Container[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchContainers = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/containers`);
            if (!response.ok) throw new Error('Failed to fetch containers');
            const data: ContainersResponse = await response.json();
            setContainers(data.containers);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const startContainer = useCallback(async (name: string) => {
        try {
            const response = await fetch(`${API_BASE}/containers/${name}/start`, { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to start container' }));
                throw new Error(errorData.detail || 'Failed to start container');
            }
            await fetchContainers(); // Refresh list
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, [fetchContainers]);

    const stopContainer = useCallback(async (name: string) => {
        try {
            const response = await fetch(`${API_BASE}/containers/${name}/stop`, { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to stop container' }));
                throw new Error(errorData.detail || 'Failed to stop container');
            }
            await fetchContainers(); // Refresh list
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, [fetchContainers]);

    const restartContainer = useCallback(async (name: string) => {
        try {
            const response = await fetch(`${API_BASE}/containers/${name}/restart`, { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to restart container' }));
                throw new Error(errorData.detail || 'Failed to restart container');
            }
            await fetchContainers(); // Refresh list
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, [fetchContainers]);

    const rebuildContainer = useCallback(async (name: string) => {
        try {
            const response = await fetch(`${API_BASE}/containers/${name}/rebuild`, { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to rebuild container' }));
                throw new Error(errorData.detail || 'Failed to rebuild container');
            }
            await fetchContainers();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, [fetchContainers]);

    const deleteContainer = useCallback(async (name: string) => {
        try {
            const response = await fetch(`${API_BASE}/containers/${name}/delete`, { method: 'POST' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to delete container' }));
                throw new Error(errorData.detail || 'Failed to delete container');
            }
            await fetchContainers();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    }, [fetchContainers]);

    useEffect(() => {
        fetchContainers();
        const interval = setInterval(fetchContainers, pollingInterval);
        return () => clearInterval(interval);
    }, [fetchContainers, pollingInterval]);

    return {
        containers,
        error,
        loading,
        refresh: fetchContainers,
        startContainer,
        stopContainer,
        restartContainer,
        rebuildContainer,
        deleteContainer
    };
}

export default useContainers;
