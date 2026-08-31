"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "@/lib/api-client";
import type { HealthStatus } from "@/types/health";

// Reference hook for both request shapes used throughout the app.
// Copy whichever half applies when wiring up a new resource.

// --- GET pattern ---------------------------------------------------------
// useSWR(key, fetcher): fires automatically on mount, caches by `key`,
// re-fires on focus/reconnect/interval per SWRConfig. Use for reads.
export function useHealth() {
  const { data, error, isLoading, mutate } = useSWR<HealthStatus>(
    "/health",
    () => api<HealthStatus>("/health"),
  );

  return {
    health: data,
    isLoading,
    error,
    refetch: mutate,
  };
}

// --- POST/PUT/DELETE pattern ----------------------------------------------
// useSWRMutation(key, mutator): does NOT fire automatically — call the
// returned `trigger(arg)` on demand (e.g. a button click, a form submit).
// `arg` is whatever payload the mutator needs; typed via the second
// parameter's `{ arg }` destructure. Use for writes.
export function usePingHealth() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    "/health",
    (url, { arg }: { arg: unknown }) =>
      api<HealthStatus & { received: unknown }>(url, {
        method: "POST",
        body: JSON.stringify(arg),
      }),
  );

  return {
    ping: trigger,
    pingResult: data,
    isPinging: isMutating,
    pingError: error,
  };
}
