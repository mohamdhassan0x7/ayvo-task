"use client";

import { useMemo, useState } from "react";
import { useSWRConfig } from "swr";
import { useGetAppointments } from "@/hooks/appointments";
import { useUsers } from "@/hooks/useUsers";
import { IAppointment } from "@/types/appointments";
import {
  AppointmentPanel,
  AppointmentPanelTarget,
} from "@/components/AppointmentPanel";
import {
  endTimeFor,
  formatDayHeading,
  formatTime,
  isSameDay,
  nextSevenDays,
} from "@/lib/date";

const AppointmentsPage = () => {
  const [userFilter, setUserFilter] = useState("");
  const filterUserId = userFilter ? Number(userFilter) : undefined;

  const { users } = useUsers();
  const { appointments, isGetAppLoading, isGetAppError } =
    useGetAppointments(filterUserId);
  const { mutate } = useSWRConfig();

  const [panelTarget, setPanelTarget] = useState<AppointmentPanelTarget | null>(
    null,
  );

  const today = useMemo(() => new Date(), []);
  const days = useMemo(() => nextSevenDays(), []);
  const usersById = useMemo(
    () => new Map(users?.map((u) => [u.id, u.name])),
    [users],
  );

  function appointmentsForDay(day: Date): IAppointment[] {
    if (!appointments) return [];
    return appointments
      .filter((a) => isSameDay(new Date(a.startTime), day))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }

  function closePanel() {
    setPanelTarget(null);
  }

  async function handleSaved() {
    await mutate(
      (key) => typeof key === "string" && key.startsWith("/appointments"),
    );
    closePanel();
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto flex flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              Appointments
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Next 7 days, starting today
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-neutral-600 dark:text-neutral-300">
              Filter by user
              <select
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">All users</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() =>
                setPanelTarget({ mode: "create", day: new Date() })
              }
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              New appointment
            </button>
          </div>
        </div>

        {isGetAppError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
            Couldn&apos;t load appointments. Try refreshing.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
          {days.map((day) => {
            const dayAppointments = appointmentsForDay(day);
            const isToday = isSameDay(day, today);
            return (
              <div
                key={day.toISOString()}
                className={`flex min-h-[240px] flex-col gap-3 rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${
                  isToday
                    ? "border-indigo-300 bg-indigo-50/60 dark:border-indigo-700 dark:bg-indigo-950/30"
                    : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPanelTarget({ mode: "create", day })}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span
                    className={`text-sm font-semibold ${
                      isToday
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {formatDayHeading(day)}
                  </span>
                  {isToday && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white uppercase">
                      Today
                    </span>
                  )}
                </button>

                <div className="flex flex-1 flex-col gap-2.5">
                  {isGetAppLoading && (
                    <p className="text-xs text-neutral-400">Loading…</p>
                  )}
                  {!isGetAppLoading && dayAppointments.length > 0 && (
                    <div className="flex max-h-[360px] flex-col gap-2.5 overflow-y-auto pr-0.5">
                      {dayAppointments.map((appointment) => {
                        const start = new Date(appointment.startTime);
                        const end = endTimeFor(start, appointment.duration);
                        return (
                          <button
                            key={appointment.id}
                            type="button"
                            onClick={() =>
                              setPanelTarget({ mode: "edit", appointment })
                            }
                            className="shrink-0 rounded-lg border border-l-4 border-neutral-200 border-l-indigo-500 bg-neutral-50 px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-indigo-50 dark:border-neutral-800 dark:border-l-indigo-500 dark:bg-neutral-800/60 dark:hover:bg-indigo-950/40"
                          >
                            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                              {appointment.title}
                            </div>
                            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                              {formatTime(start)}–{formatTime(end)}
                            </div>
                            <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                              {usersById.get(appointment.organizerId) ??
                                "Unknown"}{" "}
                              →{" "}
                              {usersById.get(appointment.participantId) ??
                                "Unknown"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {!isGetAppLoading && (
                    <button
                      type="button"
                      onClick={() => setPanelTarget({ mode: "create", day })}
                      className={`flex items-center justify-center rounded-lg border border-dashed border-neutral-300 text-xs text-neutral-400 transition-colors hover:border-indigo-400 hover:text-indigo-500 dark:border-neutral-700 dark:hover:border-indigo-500 dark:hover:text-indigo-400 ${
                        dayAppointments.length === 0 ? "flex-1" : "shrink-0"
                      }`}
                    >
                      <span className="rounded-md px-3 py-1.5">+ Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {panelTarget && (
        <AppointmentPanel
          key={
            panelTarget.mode === "edit"
              ? `edit-${panelTarget.appointment.id}`
              : `create-${panelTarget.day.toISOString()}`
          }
          target={panelTarget}
          users={users ?? []}
          onClose={closePanel}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;
