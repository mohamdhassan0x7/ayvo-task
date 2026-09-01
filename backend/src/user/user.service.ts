import { Injectable } from '@nestjs/common';
import { UserRepository } from './repository/user.repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  getUsers() {
    return this.userRepo.getUsers();
  }

  getUserById(id: number) {
    return this.userRepo.getUsers().find((user) => user.id === id);
  }
}
