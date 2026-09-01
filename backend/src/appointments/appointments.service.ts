import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentsRepository } from './repository/appointments.repository/appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto/update-appointment.dto';
import { UserService } from 'src/user/user.service';

interface AppointmentCandidate {
  organizerId: number;
  participantId: number;
  startTime: Date;
  duration: number;
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly appointmentRepo: AppointmentsRepository,
    private readonly userService: UserService,
  ) {}

  createAppointment(dto: CreateAppointmentDto) {
    const startTime = this.validateAppointment(dto);
    return this.appointmentRepo.createAppointmnet({ ...dto, startTime });
  }

  updateAppointment(id: number, dto: UpdateAppointmentDto) {
    const existing = this.appointmentRepo.getAppointmentById(id);
    if (!existing) {
      throw new NotFoundException(`Appointment with id ${id} does not exist`);
    }

    const merged: AppointmentCandidate = {
      organizerId: dto.organizerId ?? existing.organizerId,
      participantId: dto.participantId ?? existing.participantId,
      startTime: dto.startTime ?? existing.startTime,
      duration: dto.duration ?? existing.duration,
    };

    const startTime = this.validateAppointment(merged, id);

    return this.appointmentRepo.updateAppointment(id, {
      ...dto,
      ...merged,
      startTime,
    });
  }

  deleteAppointment(id: number) {
    const existing = this.appointmentRepo.getAppointmentById(id);
    if (!existing) {
      throw new NotFoundException(`Appointment with id ${id} does not exist`);
    }

    this.appointmentRepo.deleteAppointment(id);
    return { id };
  }

  getAllAppointments(userId?: number) {
    return this.appointmentRepo.getAllAppointments(userId);
  }

  private validateAppointment(
    data: AppointmentCandidate,
    excludeAppointmentId?: number,
  ): Date {
    if (data.organizerId === data.participantId) {
      throw new BadRequestException(
        'Organizer and participant must be different users',
      );
    }

    if (!this.userService.getUserById(data.organizerId)) {
      throw new NotFoundException(
        `Organizer with id ${data.organizerId} does not exist`,
      );
    }

    if (!this.userService.getUserById(data.participantId)) {
      throw new NotFoundException(
        `Participant with id ${data.participantId} does not exist`,
      );
    }

    const startTime = new Date(data.startTime);
    if (Number.isNaN(startTime.getTime()) || startTime <= new Date()) {
      throw new BadRequestException(
        'startTime must be a valid date in the future',
      );
    }

    const endTime = new Date(startTime.getTime() + data.duration * 60000);

    if (
      this.appointmentRepo.hasConflict(
        data.organizerId,
        startTime,
        endTime,
        excludeAppointmentId,
      ) ||
      this.appointmentRepo.hasConflict(
        data.participantId,
        startTime,
        endTime,
        excludeAppointmentId,
      )
    ) {
      throw new ConflictException(
        'Organizer or participant already has an appointment during this time',
      );
    }

    return startTime;
  }
}
