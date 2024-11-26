import { Module } from '@nestjs/common';
import { KeycloakConfigModule } from '../config/keycloak/keycloak.config.module';
import { UserService } from './users/application/services/user.service';
import { UserRestController } from './users/infrastructure/adapters/in/web/user.rest.controller';
import { APP_FILTER } from '@nestjs/core';
import { UserKeycloakPersistenceAdapter } from './users/infrastructure/adapters/out/persistence/user.keycloak.persistence.adapter';
import { UserHttpExceptionFilter } from './users/infrastructure/adapters/in/web/filters/user.http.exception.filter';

@Module({
  imports: [KeycloakConfigModule],
  controllers: [UserRestController],
  providers: [
    UserService,
    {
      provide: 'UserPersistencePort',
      useClass: UserKeycloakPersistenceAdapter,
    },
    {
      provide: APP_FILTER,
      useClass: UserHttpExceptionFilter,
    },
  ],
  exports: [UserService],
})
export class UsersModule {}
