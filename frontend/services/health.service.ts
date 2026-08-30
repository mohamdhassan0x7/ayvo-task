import { serverApi } from '@/lib/api-client';
import type { HealthStatus } from '@/types/health';

export function getHealth(): Promise<HealthStatus> {
  return serverApi<HealthStatus>('/health');
}
