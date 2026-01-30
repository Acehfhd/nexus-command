import { useState, useCallback, useRef, useEffect } from 'react';

const WS_URL = 'ws://localhost:8090/ws/chat';
const API_BASE = 'http://localhost:8090';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    isStreaming?: boolean;
}

export interface ChatSession {
    id: string;
    name: string;
    created_at: string;
    message_count: number;
}

export function useAgent() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessions, setSessions] = useState<ChatSession[]>([]);

    // WebSocket refs
    const wsRef = useRef<WebSocket | null>(null);
    const streamingMessageRef = useRef<string>('');

    // Connect WebSocket on mount
    useEffect(() => {
        const connect = () => {
            wsRef.current = new WebSocket(WS_URL);

            wsRef.current.onopen = () => {
                console.log('🔌 WebSocket connected');
            };

            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.type === 'status') {
                    setIsProcessing(data.status === 'thinking');
                }

                if (data.type === 'token') {
                    if (data.done) {
                        // Finalize the streaming message
                        setMessages(prev => {
                            const updated = [...prev];
                            const lastIdx = updated.length - 1;
                            if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
                                updated[lastIdx] = {
                                    ...updated[lastIdx],
                                    isStreaming: false
                                };
                            }
                            return updated;
                        });
                        streamingMessageRef.current = '';
                        setIsProcessing(false);
                    } else {
                        // Append token to streaming message
                        streamingMessageRef.current += data.token;

                        setMessages(prev => {
                            const updated = [...prev];
                            const lastIdx = updated.length - 1;

                            // Check if the last message is the one we are streaming into
                            // If it is, update it. If not (or if list is empty), create a new one.
                            // Note: We need to be careful if user sends multiple messages rapidly, 
                            // but generally 'isProcessing' blocks that.

                            if (lastIdx >= 0 && updated[lastIdx].isStreaming) {
                                // Update existing streaming message
                                updated[lastIdx] = {
                                    ...updated[lastIdx],
                                    content: streamingMessageRef.current
                                };
                            } else {
                                // Create new streaming message
                                updated.push({
                                    role: 'assistant',
                                    content: streamingMessageRef.current,
                                    timestamp: Date.now(),
                                    isStreaming: true
                                });
                            }
                            return updated;
                        });
                    }
                }

                if (data.type === 'error') {
                    setError(data.error);
                    setIsProcessing(false);
                }
            };

            wsRef.current.onclose = () => {
                console.log('🔌 WebSocket disconnected, reconnecting...');
                // Simple reconnect logic
                setTimeout(connect, 3000);
            };

            wsRef.current.onerror = (err) => {
                console.error('WebSocket error:', err);
                // Error will trigger close, which triggers reconnect
            };
        };

        connect();

        return () => {
            if (wsRef.current) {
                // Prevent reconnect on unmount
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, []);

    const sendMessage = useCallback(async (text: string, model: string = 'nexus-swarm') => {
        if (!text.trim()) return;

        // Add user message
        const userMsg: ChatMessage = {
            role: 'user',
            content: text,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsProcessing(true);
        setError(null);
        streamingMessageRef.current = '';

        // Send via WebSocket if open
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ task: text, model }));
        } else {
            // Fallback to fetch if WebSocket not connected
            try {
                const response = await fetch(`${API_BASE}/run_task`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task: text, model }),
                });

                if (!response.ok) throw new Error('Agent failed to respond via HTTP fallback');

                const data = await response.json();
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.result || 'No response',
                    timestamp: Date.now()
                }]);
            } catch (err) {
                setError('Connection failed. WebSocket disconnected and HTTP fallback failed.');
            } finally {
                setIsProcessing(false);
            }
        }
    }, []);

    const clearChat = useCallback(() => {
        setMessages([]);
        streamingMessageRef.current = '';
    }, []);

    const saveSession = useCallback(async (name?: string): Promise<{ session_id: string; name: string }> => {
        try {
            const res = await fetch(`${API_BASE}/chat/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, name })
            });
            if (!res.ok) throw new Error('Failed to save session');
            const data = await res.json();
            await fetchSessions();
            return data;
        } catch (err) {
            const msg = 'Failed to save chat';
            setError(msg);
            throw err;
        }
    }, [messages]);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/chat/sessions`);
            if (!res.ok) throw new Error('Failed to fetch sessions');
            const data = await res.json();
            setSessions(data.sessions || []);
        } catch (err) {
            console.error('Fetch sessions error:', err);
        }
    }, []);

    const loadSession = useCallback(async (sessionId: string) => {
        try {
            const res = await fetch(`${API_BASE}/chat/load/${sessionId}`);
            if (!res.ok) throw new Error('Session not found');
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (err) {
            console.error('Load session error:', err);
            setError('Failed to load session');
        }
    }, []);

    const deleteSession = useCallback(async (sessionId: string) => {
        try {
            const res = await fetch(`${API_BASE}/chat/session/${sessionId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete session');

            setSessions(prev => prev.filter(s => s.id !== sessionId));

            // Note: We generally don't clear the chat if deleting a session unless it's the currently active one,
            // but for now we just remove it from the list.
        } catch (err) {
            console.error('Failed to delete session:', err);
            setError('Failed to delete session');
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        messages,
        isProcessing,
        error,
        sendMessage,
        clearChat,
        sessions,
        saveSession,
        loadSession,
        deleteSession, // NEW
        fetchSessions
    };
}
