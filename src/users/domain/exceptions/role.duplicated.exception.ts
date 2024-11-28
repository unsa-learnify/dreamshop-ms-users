export class RoleDuplicatedException extends Error {
  constructor(message?: string) {
    super(message || 'Role already exists');
    Object.setPrototypeOf(this, RoleDuplicatedException.prototype);
    this.name = 'RoleDuplicatedException';
  }
}
