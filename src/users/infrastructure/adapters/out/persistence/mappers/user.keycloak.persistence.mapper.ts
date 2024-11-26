import { UserRepresentation } from '@s3pweb/keycloak-admin-client-cjs';
import { Role } from 'src/users/domain/models/role.model';
import { User } from 'src/users/domain/models/user.model';

export class UserKeycloakPersistenceMapper {
  static keycloakToDomain(user: UserRepresentation): User {
    return new User(
      user.id || '',
      user.firstName || user.username || '',
      user.lastName || '',
      user.username || '',
      user.email || '',
      null,
      user.enabled,
      user.realmRoles?.map((roleName) => new Role(roleName)) || [],
    );
  }
  static domainToKeycloak(user: User): UserRepresentation {
    return {
      id: user.getId || undefined,
      username: user.getUsername,
      firstName: user.getFirstname,
      lastName: user.getLastname,
      email: user.getEmail,
      emailVerified: true,
      enabled: user.getActive,
      credentials: user.getPassword
        ? [
            {
              type: 'password',
              userLabel: 'Password',
              value: user.getPassword,
              temporary: false,
            },
          ]
        : undefined,
    };
  }
}
