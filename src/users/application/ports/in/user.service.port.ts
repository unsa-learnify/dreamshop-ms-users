import { Role } from 'src/users/domain/models/role.model';
import { User } from 'src/users/domain/models/user.model';

export interface UserServicePort {
  createOneUser(user: User): Promise<User>;
  assignRoleToUserById(userId: string, role: Role): Promise<void>;
  revokeRoleFromUserById(userId: string, role: Role): Promise<void>;
  findUsersByPage(page: number, size: number): Promise<User[]>;
  findUsersByRoleAndPage(
    role: Role,
    page: number,
    size: number,
  ): Promise<User[]>;
  findOneUserById(userId: string): Promise<User>;
  updateOneUserById(userId: string, user: User): Promise<void>;
  deleteOneUserById(userId: string): Promise<void>;
}
