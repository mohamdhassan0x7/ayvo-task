'use client';

import { SWRConfig } from 'swr';
import { api } from '@/lib/api-client';

// Global SWR setup: every useSWR(key) call defaults to fetching `key` as a
// path through the shared `api` client, unless a custom fetcher is passed.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: api,
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
