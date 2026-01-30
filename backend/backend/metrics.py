"""
Portable System Metrics Module
Auto-detects: AMD (/sys) → Nvidia (nvidia-smi) → CPU-only fallback
Works inside Docker containers with /sys mounted.
"""
import subprocess
import re
import os
import glob
import logging
from typing import Dict, Any, Optional, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("metrics")


class SystemMetrics:
    """Portable hardware metrics collector."""
    
    def __init__(self):
        self.gpu_type, self.gpu_card_path = self._detect_gpu_type()
        logger.info(f"🖥️ Detected GPU: {self.gpu_type} at {self.gpu_card_path}")
    
    def _detect_gpu_type(self) -> tuple:
        """Auto-detect GPU vendor. Returns (type, card_path)."""
        
        # Try AMD via /sys (works in containers)
        amd_cards = glob.glob("/sys/class/drm/card*/device/mem_info_vram_total")
        if amd_cards:
            # Find the card with the most VRAM (main GPU)
            best_card = None
            max_vram = 0
            for path in amd_cards:
                try:
                    with open(path, 'r') as f:
                        vram = int(f.read().strip())
                        if vram > max_vram:
                            max_vram = vram
                            # Extract card path (e.g., /sys/class/drm/card1)
                            best_card = "/".join(path.split("/")[:5])
                except:
                    continue
            if best_card:
                return ("amd", best_card)
        
        # Try AMD via rocm-smi (host system)
        try:
            result = subprocess.run(
                ["rocm-smi", "--showid"],
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0 and "GPU" in result.stdout:
                return ("amd_rocm", None)
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        
        # Try Nvidia via nvidia-smi
        try:
            result = subprocess.run(
                ["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"],
                capture_output=True, text=True, timeout=5
            )
            if result.returncode == 0 and result.stdout.strip():
                return ("nvidia", None)
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass
        
        return ("none", None)
    
    def get_gpu_metrics(self) -> Dict[str, Any]:
        """Get GPU metrics based on detected vendor."""
        if self.gpu_type == "amd":
            return self._get_amd_sys_metrics()
        elif self.gpu_type == "amd_rocm":
            return self._get_amd_rocm_metrics()
        elif self.gpu_type == "nvidia":
            return self._get_nvidia_metrics()
        else:
            return {"available": False, "vendor": "none"}
    
    def _get_amd_sys_metrics(self) -> Dict[str, Any]:
        """Read AMD GPU metrics from /sys filesystem."""
        try:
            base = self.gpu_card_path + "/device"
            
            # VRAM
            vram_total = 0
            vram_used = 0
            try:
                with open(f"{base}/mem_info_vram_total", 'r') as f:
                    vram_total = int(f.read().strip()) / (1024**3)
                with open(f"{base}/mem_info_vram_used", 'r') as f:
                    vram_used = int(f.read().strip()) / (1024**3)
            except:
                pass
            
            # Temperature - find hwmon dynamically
            temp = 0
            hwmon_dirs = glob.glob(f"{base}/hwmon/hwmon*")
            for hwmon in hwmon_dirs:
                try:
                    # Try junction temp first (more accurate for GPU workload)
                    temp_files = glob.glob(f"{hwmon}/temp*_input")
                    for tf in temp_files:
                        with open(tf, 'r') as f:
                            t = int(f.read().strip()) / 1000  # millidegrees to degrees
                            if t > temp:
                                temp = t
                except:
                    continue
            
            # GPU usage (busy percent)
            usage = 0
            try:
                with open(f"{base}/gpu_busy_percent", 'r') as f:
                    usage = int(f.read().strip())
            except:
                pass
            
            return {
                "available": True,
                "vendor": "amd",
                "vram_total_gb": round(vram_total, 1),
                "vram_used_gb": round(vram_used, 1),
                "vram_percent": round((vram_used / vram_total) * 100, 1) if vram_total > 0 else 0,
                "temperature_c": round(temp, 1),
                "usage_percent": usage
            }
        except Exception as e:
            logger.error(f"AMD /sys metrics error: {e}")
            return {"available": False, "vendor": "amd", "error": str(e)}
    
    def _get_amd_rocm_metrics(self) -> Dict[str, Any]:
        """Parse AMD GPU metrics from rocm-smi."""
        try:
            result = subprocess.run(
                ["rocm-smi", "--showmeminfo", "vram", "--showtemp", "--showuse"],
                capture_output=True, text=True, timeout=10
            )
            output = result.stdout
            
            vram_total = 0
            vram_used = 0
            temp = 0
            usage = 0
            
            for line in output.split('\n'):
                if "VRAM Total Memory" in line:
                    match = re.search(r'(\d+)', line)
                    if match:
                        vram_total = int(match.group(1)) / (1024**3)
                elif "VRAM Total Used" in line:
                    match = re.search(r'(\d+)', line)
                    if match:
                        vram_used = int(match.group(1)) / (1024**3)
                elif "Temperature" in line and "junction" in line.lower():
                    match = re.search(r'(\d+\.?\d*)', line)
                    if match:
                        temp = float(match.group(1))
                elif "GPU use" in line:
                    match = re.search(r'(\d+)', line)
                    if match:
                        usage = int(match.group(1))
            
            return {
                "available": True,
                "vendor": "amd",
                "vram_total_gb": round(vram_total, 1),
                "vram_used_gb": round(vram_used, 1),
                "vram_percent": round((vram_used / vram_total) * 100, 1) if vram_total > 0 else 0,
                "temperature_c": temp,
                "usage_percent": usage
            }
        except Exception as e:
            logger.error(f"AMD rocm-smi metrics error: {e}")
            return {"available": False, "vendor": "amd", "error": str(e)}
    
    def _get_nvidia_metrics(self) -> Dict[str, Any]:
        """Parse Nvidia GPU metrics from nvidia-smi."""
        try:
            result = subprocess.run(
                ["nvidia-smi", "--query-gpu=memory.total,memory.used,temperature.gpu,utilization.gpu",
                 "--format=csv,noheader,nounits"],
                capture_output=True, text=True, timeout=10
            )
            parts = result.stdout.strip().split(',')
            if len(parts) >= 4:
                vram_total = float(parts[0].strip()) / 1024
                vram_used = float(parts[1].strip()) / 1024
                temp = float(parts[2].strip())
                usage = float(parts[3].strip())
                
                return {
                    "available": True,
                    "vendor": "nvidia",
                    "vram_total_gb": round(vram_total, 1),
                    "vram_used_gb": round(vram_used, 1),
                    "vram_percent": round((vram_used / vram_total) * 100, 1) if vram_total > 0 else 0,
                    "temperature_c": temp,
                    "usage_percent": usage
                }
        except Exception as e:
            logger.error(f"Nvidia metrics error: {e}")
            return {"available": False, "vendor": "nvidia", "error": str(e)}
    
    def get_cpu_metrics(self) -> Dict[str, Any]:
        """Get CPU usage from /proc/stat."""
        try:
            with open('/proc/stat', 'r') as f:
                line = f.readline()
                parts = line.split()
                idle = int(parts[4])
                total = sum(int(p) for p in parts[1:])
                usage = 100 - (idle / total * 100)
            
            cpu_count = os.cpu_count() or 1
            
            return {
                "usage_percent": round(usage, 1),
                "cores": cpu_count
            }
        except Exception as e:
            return {"usage_percent": 0, "cores": 1, "error": str(e)}
    
    def get_memory_metrics(self) -> Dict[str, Any]:
        """Get RAM usage from /proc/meminfo."""
        try:
            mem_info = {}
            with open('/proc/meminfo', 'r') as f:
                for line in f:
                    parts = line.split()
                    if len(parts) >= 2:
                        key = parts[0].rstrip(':')
                        value = int(parts[1])
                        mem_info[key] = value
            
            total_gb = mem_info.get('MemTotal', 0) / (1024 * 1024)
            available_gb = mem_info.get('MemAvailable', 0) / (1024 * 1024)
            used_gb = total_gb - available_gb
            
            return {
                "total_gb": round(total_gb, 1),
                "used_gb": round(used_gb, 1),
                "available_gb": round(available_gb, 1),
                "percent": round((used_gb / total_gb) * 100, 1) if total_gb > 0 else 0
            }
        except Exception as e:
            return {"total_gb": 0, "used_gb": 0, "percent": 0, "error": str(e)}
    
    def get_uptime(self) -> Dict[str, Any]:
        """Get system uptime."""
        try:
            with open('/proc/uptime', 'r') as f:
                uptime_seconds = float(f.read().split()[0])
            
            hours = int(uptime_seconds // 3600)
            minutes = int((uptime_seconds % 3600) // 60)
            seconds = int(uptime_seconds % 60)
            
            return {
                "seconds": int(uptime_seconds),
                "formatted": f"{hours:02d}:{minutes:02d}:{seconds:02d}",
                "days": int(uptime_seconds // 86400)
            }
        except Exception as e:
            return {"seconds": 0, "formatted": "00:00:00", "error": str(e)}
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """Get all system metrics in one call."""
        return {
            "gpu": self.get_gpu_metrics(),
            "cpu": self.get_cpu_metrics(),
            "memory": self.get_memory_metrics(),
            "uptime": self.get_uptime()
        }


# Singleton instance
system_metrics = SystemMetrics()
