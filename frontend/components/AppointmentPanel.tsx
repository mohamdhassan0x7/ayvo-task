"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api-client";
import {
  AppointmentInput,
  useCreateAppointments,
  useDeleteAppointment,
  useUpdateAppointment,
} from "@/hooks/appointments";
import { IAppointment } from "@/types/appointments";
import { IUser } from "@/types/user";
import {
  defaultStartTimeFor,
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from "@/lib/date";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export type AppointmentPanelTarget =
  | { mode: "create"; day: Date }
  | { mode: "edit"; appointment: IAppointment };

interface AppointmentPanelProps {
  target: AppointmentPanelTarget;
  users: IUser[];
  onClose: () => void;
  onSaved: () => void;
}

// organizerId/participantId sit as "" until picked, same as the number
// inputs elsewhere in this app default to 0 until touched.
type AppointmentFormState = {
  title: string;
  organizerId: number | "";
  participantId: number | "";
  startTime: string; // datetime-local value
  duration: number;
};

const inputClasses =
  "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500";
const labelClasses =
  "flex flex-col gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300";

function extractErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const info = err.info as { message?: string | string[] } | undefined;
    if (Array.isArray(info?.message)) return info.message.join(", ");
    if (typeof info?.message === "string") return info.message;
  }
  return "Something went wrong. Please try again.";
}

function initialFormFor(target: AppointmentPanelTarget): AppointmentFormState {
  if (target.mode === "edit") {
    const { appointment } = target;
    return {
      title: appointment.title,
      organizerId: appointment.organizerId,
      participantId: appointment.participantId,
      startTime: toDatetimeLocalValue(new Date(appointment.startTime)),
      duration: appointment.duration,
    };
  }

  return {
    title: "",
    organizerId: "",
    participantId: "",
    startTime: toDatetimeLocalValue(defaultStartTimeFor(target.day)),
    duration: 30,
  };
}

export function AppointmentPanel({
  target,
  users,
  onClose,
  onSaved,
}: AppointmentPanelProps) {
  const isEdit = target.mode === "edit";

  const [form, setForm] = useState<AppointmentFormState>(() =>
    initialFormFor(target),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const updateForm = <K extends keyof AppointmentFormState>(
    key: K,
    value: AppointmentFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const { createAppointmens, isCreateAppLoading } = useCreateAppointments();
  const { updateAppointment, isUpdateAppLoading } = useUpdateAppointment();
  const { deleteAppointment, isDeleteAppLoading } = useDeleteAppointment();

  const isSaving = isCreateAppLoading || isUpdateAppLoading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (form.organizerId === "" || form.participantId === "") {
      setFormError("Select an organizer and a participant.");
      return;
    }
    if (form.organizerId === form.participantId) {
      setFormError("Organizer and participant must be different users.");
      return;
    }
    const parsedStart = fromDatetimeLocalValue(form.startTime);
    if (Number.isNaN(parsedStart.getTime())) {
      setFormError("Enter a valid start time.");
      return;
    }
    if (!form.duration || form.duration <= 0) {
      setFormError("Duration must be greater than 0.");
      return;
    }

    const payload: AppointmentInput = {
      title: form.title.trim(),
      organizerId: form.organizerId,
      participantId: form.participantId,
      startTime: parsedStart.toISOString(),
      duration: form.duration,
    };

    try {
      if (target.mode === "create") {
        await createAppointmens(payload);
      } else {
        await updateAppointment({ id: target.appointment.id, data: payload });
      }
      onSaved();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    }
  }

  async function confirmDelete() {
    if (target.mode !== "edit") return;

    try {
      await deleteAppointment({ id: target.appointment.id });
      onSaved();
    } catch (err) {
      setFormError(extractErrorMessage(err));
      setIsConfirmingDelete(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]"
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex h-full w-full max-w-sm flex-col gap-6 overflow-y-auto border-l border-neutral-200 bg-white p-6 shadow-2xl sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 pb-5 dark:border-neutral-800">
          <div>
            <p className="text-xs font-medium tracking-wide text-indigo-600 uppercase dark:text-indigo-400">
              {isEdit ? "Edit" : "New"}
            </p>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              {isEdit ? "Edit appointment" : "New appointment"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </div>

        <label className={labelClasses}>
          Title
          <input
            className={inputClasses}
            value={form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            placeholder="Appointment title"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className={labelClasses}>
            Organizer
            <select
              className={inputClasses}
              value={form.organizerId}
              onChange={(e) =>
                updateForm(
                  "organizerId",
                  e.target.value ? Number(e.target.value) : "",
                )
              }
            >
              <option value="">Select</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClasses}>
            Participant
            <select
              className={inputClasses}
              value={form.participantId}
              onChange={(e) =>
                updateForm(
                  "participantId",
                  e.target.value ? Number(e.target.value) : "",
                )
              }
            >
              <option value="">Select</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={labelClasses}>
          Start time
          <input
            type="datetime-local"
            className={inputClasses}
            value={form.startTime}
            onChange={(e) => updateForm("startTime", e.target.value)}
          />
        </label>

        <label className={labelClasses}>
          Duration (minutes)
          <input
            type="number"
            min={1}
            className={inputClasses}
            value={form.duration}
            onChange={(e) => updateForm("duration", Number(e.target.value))}
          />
        </label>

        {formError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
            {formError}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-neutral-100 pt-6 dark:border-neutral-800">
          {isEdit ? (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isDeleteAppLoading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Create appointment"}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={isConfirmingDelete}
        title="Delete appointment?"
        description={`"${form.title}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        isConfirming={isDeleteAppLoading}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </div>
  );
}
