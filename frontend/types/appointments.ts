export interface IAppointment {
  id: number;
  title: string;
  organizerId: number;
  participantId: number;
  startTime: Date;
  duration: number;
}
