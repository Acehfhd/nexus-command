import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:8090';

export interface UserConfig {
    voice_enabled: boolean;
    voice_id: string;
    avatar_id: string;
    theme: {
        background: string;
        effects: string;
        neon: boolean;
    };
    council: {
        homework: string;
        coding: string;
        research: string;
    };
    connections: any[];
    notifications: boolean;
    auto_connect: boolean;
    [key: string]: any;
}

const DEFAULT_CONFIG: UserConfig = {
    voice_enabled: true,
    voice_id: 'af_heart',
    avatar_id: 'nexus_default',
    theme: {
        background: "cyberpunk",
        effects: "high",
        neon: true
    },
    council: {
        homework: "deepseek-r1:14b",
        coding: "qwen/qwen-3-coder-480b-instruct:free",
        research: "google/gemini-2.0-flash-exp:free"
    },
    connections: [
        { name: "Ollama", endpoint: "nexus-ollama:11434", key: "Ollama" },
        { name: "ComfyUI", endpoint: "nexus-comfyui:8188", key: "ComfyUI" },
        { name: "n8n", endpoint: "nexus-n8n:5678", key: "n8n" },
    ],
    notifications: true,
    auto_connect: false
};

export function useConfig() {
    const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/config`);
            if (res.ok) {
                const data = await res.json();
                setConfig({ ...DEFAULT_CONFIG, ...data });
            }
        } catch (err) {
            console.error('Failed to load config:', err);
            // Keep defaults on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateConfig = async (newConfig: Partial<UserConfig>) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            if (!res.ok) throw new Error('Failed to save config');

            const data = await res.json();
            setConfig(data.config || { ...config, ...newConfig });
            return true;
        } catch (err) {
            console.error('Failed to update config:', err);
            setError(err instanceof Error ? err.message : 'Update failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    return {
        config,
        updateConfig,
        isLoading,
        error,
        refresh: fetchConfig
    };
}
