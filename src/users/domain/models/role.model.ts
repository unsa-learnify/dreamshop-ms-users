export class Role {
  constructor(private name: string) {}
  get getName(): string {
    return this.name;
  }
}
