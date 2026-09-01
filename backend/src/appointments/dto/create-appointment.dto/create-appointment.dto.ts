import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  title: string;

  @IsNumber()
  organizerId: number;

  @IsNumber()
  participantId: number;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @IsNumber()
  @IsPositive()
  duration: number;
}
