import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = 'http://localhost:8090';

export interface LogEntry {
    timestamp: string;
    level: 'info' | 'success' | 'warning' | 'error';
    message: string;
}

// Parse log lines into structured entries
function parseLogLine(line: string): LogEntry | null {
    if (!line.trim()) return null;

    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    // Determine log level based on content
    let level: LogEntry['level'] = 'info';
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('error') || lowerLine.includes('fail')) {
        level = 'error';
    } else if (lowerLine.includes('warn')) {
        level = 'warning';
    } else if (lowerLine.includes('success') || lowerLine.includes('ready') || lowerLine.includes('loaded')) {
        level = 'success';
    }

    return { timestamp, level, message: line.trim() };
}

export function useSystemLogs(containerName: string = 'nexus-ollama', pollingInterval = 5000, tail = 20) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const prevLogsRef = useRef<string>('');

    const fetchLogs = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/containers/${containerName}/logs?tail=${tail}`);
            if (!response.ok) throw new Error('Failed to fetch logs');
            const data = await response.json();

            // Only update if logs changed
            const logsText = data.logs || '';
            if (logsText !== prevLogsRef.current) {
                prevLogsRef.current = logsText;

                const lines = logsText.split('\n');
                const entries: LogEntry[] = lines
                    .map(parseLogLine)
                    .filter((e: LogEntry | null): e is LogEntry => e !== null)
                    .slice(-tail);

                setLogs(entries);
            }
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [containerName, tail]);

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, pollingInterval);
        return () => clearInterval(interval);
    }, [fetchLogs, pollingInterval]);

    return { logs, error, loading, refresh: fetchLogs };
}

export default useSystemLogs;
