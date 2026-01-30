import { useState, useCallback } from 'react';

// For development, we might call n8n via our own backend bridge 
// to avoid exposing the API key in the browser.
const API_BASE = 'http://localhost:8090';

export interface N8nWorkflow {
    id: string;
    name: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export function useN8n() {
    const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkflows = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/n8n/workflows`);
            if (!response.ok) throw new Error('Failed to fetch n8n workflows');
            const data = await response.json();
            setWorkflows(data.data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Trigger a workflow via its webhook path.
     * Each workflow in n8n must have a Webhook node as its trigger.
     * @param webhookPath - The path set in n8n's Webhook node (e.g., "nexus-router")
     * @param payload - Optional JSON payload to send
     */
    const triggerWebhook = useCallback(async (webhookPath: string, payload?: Record<string, unknown>) => {
        try {
            const response = await fetch(`${API_BASE}/n8n/webhook/${webhookPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload || {}),
            });
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Webhook trigger error');
            return null;
        }
    }, []);

    /**
     * Activate a workflow so its webhook becomes available.
     * @param workflowId - The n8n workflow ID
     */
    const activateWorkflow = useCallback(async (workflowId: string) => {
        try {
            const response = await fetch(`${API_BASE}/n8n/workflows/${workflowId}/activate`, {
                method: 'POST',
            });
            if (!response.ok) throw new Error('Activation failed');
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Activation error');
            return null;
        }
    }, []);

    // DEPRECATED: Use triggerWebhook instead
    const triggerWorkflow = useCallback(async (workflowId: string) => {
        console.warn('triggerWorkflow is deprecated. Use triggerWebhook(path, payload) instead.');
        setError('Direct execution not supported. Use webhook triggers.');
        return null;
    }, []);

    return {
        workflows,
        loading,
        error,
        fetchWorkflows,
        triggerWorkflow,  // Deprecated
        triggerWebhook,   // New: trigger via webhook path
        activateWorkflow, // New: activate workflow
    };
}
