import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatSpeed(speed) {
  if (!speed) return 'N/A';
  return `${speed.toFixed(2)} Mbps`;
}

export function formatLatency(latency) {
  if (!latency) return 'N/A';
  return `${latency.toFixed(2)} ms`;
}

export function formatPacketLoss(loss) {
  if (!loss) return 'N/A';
  return `${(loss * 100).toFixed(2)}%`;
}

export function getSpeedColor(speed) {
  if (speed >= 50) return '#10b981'; // green
  if (speed >= 25) return '#f59e0b'; // amber
  if (speed >= 10) return '#f97316'; // orange
  return '#ef4444'; // red
}
