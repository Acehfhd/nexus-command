
import shutil
import psutil
import json
import sys

# 🌌 NEXUS PRIME HARDWARE DISCOVERY
# This script runs on the HOST (or via mapped /proc) to detect capabilities.

def get_system_specs():
    specs = {
        "ram_total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
        "cpu_cores": psutil.cpu_count(logical=True),
        "gpu_type": "cpu",
        "vram_gb": 0,
        "rocm_version": None
    }

    # Detect GPU (Prioritize AMD for User)
    if shutil.which('rocm-smi'):
        specs['gpu_type'] = 'amd_rocm'
        # Default for 7900 GRE
        specs['vram_gb'] = 16 
        specs['rocm_version'] = "6.1"
    elif shutil.which('nvidia-smi'):
        specs['gpu_type'] = 'nvidia_cuda'
        specs['vram_gb'] = 24 # Assumption or need subprocess call
    
    return specs

if __name__ == "__main__":
    specs = get_system_specs()
    # Print JSON for the Orchestrator to read
    print(json.dumps(specs, indent=2))
