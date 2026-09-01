"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "@/lib/api-client";
import { IAppointment } from "@/types/appointments";

// Reference hook for both request shapes used throughout the app.
// Copy whichever half applies when wiring up a new resource.

export type AppointmentInput = {
  title: string;
  organizerId: number;
  participantId: number;
  startTime: string; // ISO string
  duration: number;
};

// --- GET pattern ---------------------------------------------------------
// useSWR(key, fetcher): fires automatically on mount, caches by `key`,
// re-fires on focus/reconnect/interval per SWRConfig. Use for reads.
// Pass `userId` to filter to appointments where that user is the
// organizer or the participant.
export function useGetAppointments(userId?: number) {
  const key = userId ? `/appointments?userId=${userId}` : "/appointments";
  const { data, error, isLoading, mutate } = useSWR<IAppointment[]>(key, () =>
    api<IAppointment[]>(key),
  );

  return {
    appointments: data,
    isGetAppLoading: isLoading,
    isGetAppError: error,
    refetch: mutate,
  };
}

// --- POST/PUT/DELETE pattern ----------------------------------------------
// useSWRMutation(key, mutator): does NOT fire automatically — call the
// returned `trigger(arg)` on demand (e.g. a button click, a form submit).
// `arg` is whatever payload the mutator needs; typed via the second
// parameter's `{ arg }` destructure. Use for writes.
export function useCreateAppointments() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    "/appointments",
    (url, { arg }: { arg: AppointmentInput }) =>
      api<IAppointment>(url, {
        method: "POST",
        body: JSON.stringify(arg),
      }),
  );

  return {
    createAppointmens: trigger,
    appointment: data,
    isCreateAppLoading: isMutating,
    isCreateAppError: error,
  };
}

export function useUpdateAppointment() {
  const { trigger, data, isMutating, error } = useSWRMutation(
    "/appointments",
    (
      url,
      { arg }: { arg: { id: number; data: Partial<AppointmentInput> } },
    ) =>
      api<IAppointment>(`${url}/${arg.id}`, {
        method: "PATCH",
        body: JSON.stringify(arg.data),
      }),
  );

  return {
    updateAppointment: trigger,
    appointment: data,
    isUpdateAppLoading: isMutating,
    isUpdateAppError: error,
  };
}

export function useDeleteAppointment() {
  const { trigger, isMutating, error } = useSWRMutation(
    "/appointments",
    (url, { arg }: { arg: { id: number } }) =>
      api<{ id: number }>(`${url}/${arg.id}`, {
        method: "DELETE",
      }),
  );

  return {
    deleteAppointment: trigger,
    isDeleteAppLoading: isMutating,
    isDeleteAppError: error,
  };
}
