export class UserRestResponse {
  constructor(
    private readonly id: string,
    private readonly firstname: string,
    private readonly lastname: string,
    private readonly username: string,
    private readonly email: string,
    private readonly isActive: boolean,
    private readonly roles: string[],
  ) {}
}
