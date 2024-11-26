export class KeycloakException extends Error {
  constructor(
    message: string,
    public readonly cause?: any,
  ) {
    super(message);
    this.name = 'KeycloakException';
  }
}
