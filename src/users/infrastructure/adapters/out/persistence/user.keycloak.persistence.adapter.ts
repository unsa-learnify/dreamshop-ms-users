import { Injectable, Logger } from '@nestjs/common';
import {
  KeycloakAdminClient,
  RoleRepresentation,
} from '@s3pweb/keycloak-admin-client-cjs';
import { KeycloakConfigService } from 'config/keycloak/keycloak.config.service';
import { UserPersistencePort } from 'src/users/application/ports/out/user.persistence.port';
import { UserNotFoundException } from 'src/users/domain/exceptions/user.not.found.exception';
import { UserDuplicatedException } from 'src/users/domain/exceptions/user.duplicated.exception';
import { RoleNotFoundException } from 'src/users/domain/exceptions/role.not.found.exception';
import { User } from 'src/users/domain/models/user.model';
import { Role } from 'src/users/domain/models/role.model';
import { KeycloakConnectionException } from './exceptions/keycloak.connection.exception';
import { UserKeycloakPersistenceMapper } from './mappers/user.keycloak.persistence.mapper';

@Injectable()
export class UserKeycloakPersistenceAdapter implements UserPersistencePort {
  private readonly logger = new Logger(UserKeycloakPersistenceAdapter.name);
  private keycloakAdminClient: KeycloakAdminClient;
  private clientUniqueId: string | null = null;
  constructor(private readonly keycloakConfigService: KeycloakConfigService) {
    this.keycloakAdminClient = new KeycloakAdminClient({
      baseUrl: this.keycloakConfigService.serverUrl,
      realmName: this.keycloakConfigService.clientRealm,
    });
    this.initializeClientUniqueId()
      .then(() => {
        this.logger.log('Client Unique Id initialized successfully.');
      })
      .catch((error) => {
        this.logger.error('Failed to initialize Client Unique Id', error);
      });
  }
  async createOneUser(user: User): Promise<User> {
    try {
      await this.authenticateClient();
      await this.ensureUserDoesNotExist(user);
      const userRepresentation =
        UserKeycloakPersistenceMapper.domainToKeycloak(user);
      const createdUser =
        await this.keycloakAdminClient.users.create(userRepresentation);
      if (!createdUser.id) {
        throw new KeycloakConnectionException(
          'Failed to create user in Keycloak',
        );
      }
      const guestRole = await this.getRoleByName('guest');
      await this.assignRoleToUserInKeycloak(createdUser.id, guestRole);
      const userFromKeycloak = await this.getUserFromKeycloak(createdUser.id);
      userFromKeycloak.realmRoles = [guestRole.name];
      return UserKeycloakPersistenceMapper.keycloakToDomain(userFromKeycloak);
    } catch (error) {
      this.handleError(error, 'creating a user');
    }
  }
  async assignRoleToUserById(userId: string, role: Role): Promise<void> {
    try {
      await this.authenticateClient();
      const user = await this.getUserFromKeycloak(userId);
      const roleToAssign = await this.getRoleByName(role.getName);
      await this.assignRoleToUserInKeycloak(user.id, roleToAssign);
    } catch (error) {
      this.handleError(
        error,
        `assigning role ${role.getName} to user with id ${userId}`,
      );
    }
  }
  async revokeRoleFromUserById(userId: string, role: Role): Promise<void> {
    try {
      await this.authenticateClient();
      const user = await this.getUserFromKeycloak(userId);
      const roleToRevoke = await this.getRoleByName(role.getName);
      await this.revokeRoleFromUserInKeycloak(user.id, roleToRevoke);
    } catch (error) {
      this.handleError(
        error,
        `revoking role ${role.getName} from user with id ${userId}`,
      );
    }
  }
  async updateOneUserById(userId: string, user: User): Promise<void> {
    try {
      await this.authenticateClient();
      const existingUser = await this.getUserFromKeycloak(userId);
      await this.ensureNoConflicts(userId, user);
      const updatedUser = {
        ...existingUser,
        ...UserKeycloakPersistenceMapper.domainToKeycloak(user),
      };
      delete updatedUser.id;
      await this.keycloakAdminClient.users.update({ id: userId }, updatedUser);
    } catch (error) {
      this.handleError(error, `updating user with id ${userId}`);
    }
  }
  async deleteOneUserById(userId: string): Promise<void> {
    try {
      await this.authenticateClient();
      await this.getUserFromKeycloak(userId);
      await this.keycloakAdminClient.users.del({ id: userId });
    } catch (error) {
      this.handleError(error, `deleting user with id ${userId}`);
    }
  }
  async findOneUserById(userId: string): Promise<User> {
    try {
      await this.authenticateClient();
      const user = await this.getUserFromKeycloak(userId);
      const roles = await this.getUserRolesFromKeycloak(userId);
      user.realmRoles = roles.map((role) => role.name);
      return UserKeycloakPersistenceMapper.keycloakToDomain(user);
    } catch (error) {
      this.handleError(error, `fetching user with id ${userId}`);
    }
  }
  async findUsersByPage(page: number, size: number): Promise<User[]> {
    try {
      await this.authenticateClient();
      const offset = page * size;
      const users = await this.keycloakAdminClient.users.find({
        max: size,
        first: offset,
      });
      if (!users.length) return [];
      return Promise.all(
        users.map(async (user) => {
          const roles = await this.getUserRolesFromKeycloak(user.id!);
          user.realmRoles = roles.map((role) => role.name);
          return UserKeycloakPersistenceMapper.keycloakToDomain(user);
        }),
      );
    } catch (error) {
      this.handleError(
        error,
        `fetching users for page ${page} and size ${size}`,
      );
    }
  }
  async findUsersByRoleAndPage(
    role: Role,
    page: number,
    size: number,
  ): Promise<User[]> {
    try {
      await this.authenticateClient();
      if (!this.clientUniqueId) {
        throw new KeycloakConnectionException(`Client Id not initialized`);
      }
      const keycloakRole = await this.getRoleByName(role.getName);
      if (!keycloakRole.id) {
        throw new RoleNotFoundException(`Role ${role.getName} not found`);
      }
      const offset = page * size;
      const users = await this.keycloakAdminClient.clients.findUsersWithRole({
        id: this.clientUniqueId,
        roleName: role.getName,
        first: offset,
        max: size,
      });
      if (!users || !Array.isArray(users) || users.length === 0) {
        return [];
      }
      return await Promise.all(
        users.map(async (user) => {
          const roles = await this.getUserRolesFromKeycloak(user.id!);
          user.realmRoles = roles.map((role) => role.name);
          return UserKeycloakPersistenceMapper.keycloakToDomain(user);
        }),
      );
    } catch (error) {
      this.handleError(
        error,
        `fetching users with role ${role.getName} for page ${page} and size ${size}`,
      );
    }
  }
  private async authenticateClient(): Promise<void> {
    try {
      await this.keycloakAdminClient.auth({
        clientId: 'admin-cli',
        clientSecret: this.keycloakConfigService.adminSecret,
        grantType: 'client_credentials',
      });
    } catch (error) {
      throw new KeycloakConnectionException(
        'Failed to authenticate with Keycloak Admin CLI',
      );
    }
  }
  private async initializeClientUniqueId(): Promise<void> {
    try {
        await this.authenticateClient();
        const clients = await this.keycloakAdminClient.clients.find();
        const client = clients.find(
          (client) => client.clientId === this.keycloakConfigService.clientId,
        );
        if (!client?.id) {
          throw new KeycloakConnectionException(
            `Client id ${this.keycloakConfigService.clientId} not found`,
          );
        }
      this.clientUniqueId = client.id;
    } catch (error) {
      throw new KeycloakConnectionException(
        'Failed to initialize client unique id',
      );
    }
  }
  private async ensureUserDoesNotExist(user: User): Promise<void> {
    const existingUsers = await this.keycloakAdminClient.users.find({
      email: user.getEmail,
      username: user.getUsername,
    });
    if (existingUsers.length > 0) {
      throw new UserDuplicatedException(
        `User with email ${user.getEmail} or username ${user.getUsername} already exists`,
      );
    }
  }
  private async getUserFromKeycloak(userId: string): Promise<any> {
    const user = await this.keycloakAdminClient.users.findOne({ id: userId });
    if (!user)
      throw new UserNotFoundException(`User with id ${userId} not found`);
    return user;
  }
  private async getRoleByName(roleName: string): Promise<RoleRepresentation> {
    if (!this.clientUniqueId)
      throw new KeycloakConnectionException('Client ID not initialized');
    const roles = await this.keycloakAdminClient.clients.listRoles({
      id: this.clientUniqueId,
    });
    const role = roles.find((r) => r.name === roleName);
    if (!role) throw new RoleNotFoundException(`Role ${roleName} not found`);
    return role;
  }
  private async assignRoleToUserInKeycloak(
    userId: string,
    role: any,
  ): Promise<void> {
    await this.keycloakAdminClient.users.addClientRoleMappings({
      id: userId,
      clientUniqueId: this.clientUniqueId!,
      roles: [{ id: role.id, name: role.name }],
    });
  }
  private async revokeRoleFromUserInKeycloak(
    userId: string,
    role: any,
  ): Promise<void> {
    await this.keycloakAdminClient.users.delClientRoleMappings({
      id: userId,
      clientUniqueId: this.clientUniqueId!,
      roles: [{ id: role.id, name: role.name }],
    });
  }
  private async getUserRolesFromKeycloak(userId: string): Promise<any[]> {
    return this.keycloakAdminClient.users.listClientRoleMappings({
      id: userId,
      clientUniqueId: this.clientUniqueId!,
    });
  }
  private async ensureNoConflicts(userId: string, user: User): Promise<void> {
    const conflictingUsers = await this.keycloakAdminClient.users.find({
      email: user.getEmail,
      username: user.getUsername,
    });
    const isConflict = conflictingUsers.some(
      (conflict) => conflict.id !== userId,
    );
    if (isConflict) {
      throw new UserDuplicatedException(
        `Email ${user.getEmail} or username ${user.getUsername} already in use`,
      );
    }
  }
  private handleError(error: any, action: string): never {
    if (
      error instanceof UserNotFoundException ||
      error instanceof UserDuplicatedException ||
      error instanceof RoleNotFoundException
    ) {
      throw error;
    }
    this.logger.error(`Something went wrong while ${action}`, error);
    throw new KeycloakConnectionException(
      `An unexpected error occurred while ${action}`,
    );
  }
}
