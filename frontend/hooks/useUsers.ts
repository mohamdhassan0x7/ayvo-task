"use client";

import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "@/lib/api-client";
import { IUser } from "@/types/user";

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR<IUser[]>("/health", () =>
    api<IUser[]>("/user"),
  );

  return {
    users: data,
    isLoading,
    error,
    refetch: mutate,
  };
}
