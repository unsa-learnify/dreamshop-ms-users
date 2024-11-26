import { User } from 'src/users/domain/models/user.model';
import { UserServicePort } from '../ports/in/user.service.port';
import { Inject, Injectable } from '@nestjs/common';
import { UserPersistencePort } from '../ports/out/user.persistence.port';
import { Role } from 'src/users/domain/models/role.model';

@Injectable()
export class UserService implements UserServicePort {
  constructor(
    @Inject('UserPersistencePort')
    private readonly userPersistencePort: UserPersistencePort,
  ) {}
  async createOneUser(user: User): Promise<User> {
    return await this.userPersistencePort.createOneUser(user);
  }
  async assignRoleToUserById(userId: string, role: Role): Promise<void> {
    await this.userPersistencePort.assignRoleToUserById(userId, role);
  }
  async revokeRoleFromUserById(userId: string, role: Role): Promise<void> {
    await this.userPersistencePort.revokeRoleFromUserById(userId, role);
  }
  async findUsersByPage(page: number, size: number): Promise<User[]> {
    return await this.userPersistencePort.findUsersByPage(page, size);
  }
  async findUsersByRoleAndPage(
    role: Role,
    page: number,
    size: number,
  ): Promise<User[]> {
    return await this.userPersistencePort.findUsersByRoleAndPage(
      role,
      page,
      size,
    );
  }
  async findOneUserById(userId: string): Promise<User> {
    return this.userPersistencePort.findOneUserById(userId);
  }
  async updateOneUserById(userId: string, user: User): Promise<void> {
    await this.userPersistencePort.updateOneUserById(userId, user);
  }
  async deleteOneUserById(userId: string): Promise<void> {
    await this.userPersistencePort.deleteOneUserById(userId);
  }
}
