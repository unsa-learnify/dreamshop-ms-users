export class RoleNotFoundException extends Error {
  constructor(message?: string) {
    super(message || 'Role not found');
    Object.setPrototypeOf(this, RoleNotFoundException.prototype);
    this.name = 'RoleNotFoundException';
  }
}
