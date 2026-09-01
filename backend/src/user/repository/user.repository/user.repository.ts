import { Injectable } from '@nestjs/common';

const users = [
  {
    id: 1,
    name: 'Alice',
  },
  {
    id: 2,
    name: 'Bob',
  },
  {
    id: 3,
    name: 'Carol',
  },
];

@Injectable()
export class UserRepository {
  constructor() {}

  getUsers() {
    return users;
  }
}
