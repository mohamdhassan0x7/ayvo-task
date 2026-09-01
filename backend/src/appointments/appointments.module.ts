import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsRepository } from './repository/appointments.repository/appointments.repository';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [AppointmentsService, AppointmentsRepository],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
