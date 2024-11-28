import { Role } from './role.model';

export class User {
  constructor(
    private id: string,
    private firstname: string,
    private lastname: string,
    private username: string,
    private email: string,
    private password: string,
    private isActive: boolean,
    private roles: Role[],
  ) {}
  get getId(): string {
    return this.id;
  }
  get getFirstname(): string {
    return this.firstname;
  }
  get getLastname(): string {
    return this.lastname;
  }
  get getUsername(): string {
    return this.username;
  }
  get getEmail(): string {
    return this.email;
  }
  get getPassword(): string {
    return this.password;
  }
  get getActive(): boolean {
    return this.isActive;
  }
  get getRoles(): Role[] {
    return this.roles;
  }
}
