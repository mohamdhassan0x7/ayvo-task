import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from 'src/appointments/dto/create-appointment.dto/create-appointment.dto';
import { IAppointment } from 'src/appointments/types/appointment.type';

@Injectable()
export class AppointmentsRepository {
  private Appointments: IAppointment[] = [];
  private idInc;
  constructor() {
    this.idInc = 0;
  }

  createAppointmnet(appointment: CreateAppointmentDto) {
    return this.pushAppointment(appointment);
  }

  getAllAppointments(userId?: number) {
    const appointments = userId
      ? this.Appointments.filter(
          (appointment) =>
            appointment.organizerId === userId ||
            appointment.participantId === userId,
        )
      : this.Appointments;

    return [...appointments].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );
  }

  hasConflict(
    userId: number,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: number,
  ): boolean {
    return this.Appointments.some((appointment) => {
      if (
        excludeAppointmentId !== undefined &&
        appointment.id === excludeAppointmentId
      ) {
        return false;
      }

      const involvesUser =
        appointment.organizerId === userId ||
        appointment.participantId === userId;
      if (!involvesUser) {
        return false;
      }

      const existingEnd = new Date(
        appointment.startTime.getTime() + appointment.duration * 60000,
      );
      return appointment.startTime < endTime && startTime < existingEnd;
    });
  }

  getAppointmentById(id: number): IAppointment | undefined {
    return this.Appointments.find((appointment) => appointment.id === id);
  }

  updateAppointment(
    id: number,
    appointment: Partial<Omit<IAppointment, 'id'>>,
  ): IAppointment | undefined {
    const index = this.Appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      return undefined;
    }

    this.Appointments[index] = {
      ...this.Appointments[index],
      ...appointment,
      id,
    };
    return this.Appointments[index];
  }

  deleteAppointment(id: number): boolean {
    const index = this.Appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      return false;
    }

    this.Appointments.splice(index, 1);
    return true;
  }

  private pushAppointment(appointment: CreateAppointmentDto) {
    this.idInc++;
    this.Appointments.push({ ...appointment, id: this.idInc });
    return { ...appointment, id: this.idInc };
  }
}
