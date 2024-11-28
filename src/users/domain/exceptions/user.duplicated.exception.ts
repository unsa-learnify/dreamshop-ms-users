export class UserDuplicatedException extends Error {
  constructor(message?: string) {
    super(message || 'User already exists');
    Object.setPrototypeOf(this, UserDuplicatedException.prototype);
    this.name = 'UserDuplicatedException';
  }
}
