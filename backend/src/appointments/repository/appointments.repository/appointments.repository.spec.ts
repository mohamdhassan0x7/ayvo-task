import { AppointmentsRepository } from './appointments.repository';

describe('AppointmentsRepository', () => {
  it('should be defined', () => {
    expect(new AppointmentsRepository()).toBeDefined();
  });
});
