import { useState, useCallback } from 'react';

const NEXUS_API = 'http://localhost:8090'; // Backend Proxy

export interface ComfyQueueStatus {
    queue_running: number;
    queue_pending: number;
}

export interface ComfyPromptResponse {
    prompt_id: string;
    number: number;
}

export interface ComfyHistoryItem {
    prompt: any;
    outputs: Record<string, { images?: Array<{ filename: string; subfolder: string; type: string }> }>;
}

export function useComfyUI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [queueStatus, setQueueStatus] = useState<ComfyQueueStatus | null>(null);
    const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);

    // Get queue status
    const getQueue = useCallback(async () => {
        try {
            const response = await fetch(`${NEXUS_API}/comfyui/queue`);
            if (!response.ok) throw new Error('Failed to fetch queue');
            const data = await response.json();
            setQueueStatus({
                queue_running: data.queue_running?.length || 0,
                queue_pending: data.queue_pending?.length || 0,
            });
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Queue error');
            return null;
        }
    }, []);

    // Submit a prompt (workflow)
    const submitPrompt = useCallback(async (workflow: any, clientId?: string) => {
        setLoading(true);
        setError(null);
        try {
            const payload: any = { prompt: workflow };
            if (clientId) payload.client_id = clientId;

            const response = await fetch(`${NEXUS_API}/comfyui/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || 'Failed to submit prompt');
            }

            const result: ComfyPromptResponse = await response.json();
            setCurrentPromptId(result.prompt_id);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Submit error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get history for a specific prompt
    const getHistory = useCallback(async (promptId: string): Promise<ComfyHistoryItem | null> => {
        try {
            const response = await fetch(`${NEXUS_API}/comfyui/history/${promptId}`);
            if (!response.ok) throw new Error('Failed to fetch history');
            const data = await response.json();
            return data[promptId] || null;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'History error');
            return null;
        }
    }, []);

    // Get image URL from ComfyUI output
    const getImageUrl = useCallback((filename: string, subfolder: string = '', type: string = 'output') => {
        const params = new URLSearchParams({ filename, subfolder, type });
        return `${NEXUS_API}/comfyui/view?${params.toString()}`;
    }, []);

    // Simple generation (Text-to-Image or Img2Img)
    const generateImage = useCallback(async (
        prompt: string,
        negativePrompt: string = '',
        options: { model: string; steps: string; aspect: string; inputImage?: string; denoise?: number } = { model: 'sdxl', steps: '30', aspect: '1:1' }
    ) => {
        // Basic workflow template
        const isImg2Img = !!options.inputImage;
        const seed = Math.floor(Math.random() * 1000000000);

        let workflow: any = {};

        if (isImg2Img) {
            // Img2Img Workflow
            workflow = {
                "3": {
                    "class_type": "KSampler",
                    "inputs": {
                        "cfg": 7,
                        "denoise": options.denoise || 0.6,
                        "latent_image": ["10", 0],
                        "model": ["4", 0],
                        "negative": ["7", 0],
                        "positive": ["6", 0],
                        "sampler_name": "euler",
                        "scheduler": "normal",
                        "seed": seed,
                        "steps": parseInt(options.steps)
                    }
                },
                "4": { "class_type": "CheckpointLoaderSimple", "inputs": { "ckpt_name": "juggernaut_xl.safetensors" } },
                "6": { "class_type": "CLIPTextEncode", "inputs": { "clip": ["4", 1], "text": prompt } },
                "7": { "class_type": "CLIPTextEncode", "inputs": { "clip": ["4", 1], "text": negativePrompt } },
                "8": { "class_type": "VAEDecode", "inputs": { "samples": ["3", 0], "vae": ["4", 2] } },
                "9": { "class_type": "SaveImage", "inputs": { "filename_prefix": "NexusImg2Img", "images": ["8", 0] } },
                "10": {
                    "class_type": "VAEEncode",
                    "inputs": {
                        "pixels": ["11", 0],
                        "vae": ["4", 2]
                    }
                },
                "11": {
                    "class_type": "LoadImage",
                    "inputs": {
                        "image": options.inputImage,
                        "upload": "image"
                    }
                }
            };
        } else {
            // Text-to-Image Workflow
            workflow = {
                "3": {
                    "class_type": "KSampler",
                    "inputs": {
                        "cfg": 7,
                        "denoise": 1,
                        "latent_image": ["5", 0],
                        "model": ["4", 0],
                        "negative": ["7", 0],
                        "positive": ["6", 0],
                        "sampler_name": "euler",
                        "scheduler": "normal",
                        "seed": seed,
                        "steps": parseInt(options.steps)
                    }
                },
                "4": { "class_type": "CheckpointLoaderSimple", "inputs": { "ckpt_name": "juggernaut_xl.safetensors" } },
                "5": { "class_type": "EmptyLatentImage", "inputs": { "batch_size": 1, "height": 1024, "width": 1024 } },
                "6": { "class_type": "CLIPTextEncode", "inputs": { "clip": ["4", 1], "text": prompt } },
                "7": { "class_type": "CLIPTextEncode", "inputs": { "clip": ["4", 1], "text": negativePrompt } },
                "8": { "class_type": "VAEDecode", "inputs": { "samples": ["3", 0], "vae": ["4", 2] } },
                "9": { "class_type": "SaveImage", "inputs": { "filename_prefix": "NexusGen", "images": ["8", 0] } }
            };
        }

        return submitPrompt(workflow);
    }, [submitPrompt]);

    // Get available models/checkpoints
    const getObjectInfo = useCallback(async () => {
        try {
            const response = await fetch(`${NEXUS_API}/comfyui/object_info`);
            if (!response.ok) throw new Error('Failed to fetch object info');
            return await response.json();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Object info error');
            return null;
        }
    }, []);

    // Upload image to ComfyUI (via Nexus Proxy)
    const uploadImage = useCallback(async (file: File): Promise<string | null> => {
        // Don't set global loading here to avoid blocking UI, or handle carefully
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('overwrite', 'true');

            const response = await fetch(`${NEXUS_API}/comfyui/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload image');
            const data = await response.json();
            return data.name;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload error');
            return null;
        }
    }, []);

    return {
        loading,
        error,
        queueStatus,
        currentPromptId,
        getQueue,
        submitPrompt,
        getHistory,
        getImageUrl,
        generateImage,
        getObjectInfo,
        uploadImage,
    };
}


export default useComfyUI;
