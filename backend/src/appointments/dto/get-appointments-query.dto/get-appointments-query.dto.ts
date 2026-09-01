import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class GetAppointmentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
