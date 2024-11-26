import { KeycloakException } from './keycloak.exception';

export class KeycloakConnectionException extends KeycloakException {
  constructor(message: string) {
    super(message);
    this.name = 'KeycloakConnectionException';
  }
}
