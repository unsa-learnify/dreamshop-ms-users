import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class KeycloakConfigService {
  constructor(private readonly configService: ConfigService) {}
  get serverUrl(): string {
    return this.configService.get('keycloak.serverUrl');
  }
  get clientRealm(): string {
    return this.configService.get('keycloak.clientRealm');
  }
  get clientId(): string {
    return this.configService.get('keycloak.clientId');
  }
  get clientSecret(): string {
    return this.configService.get('keycloak.clientSecret');
  }
  get adminSecret(): string {
    return this.configService.get('keycloak.adminSecret');
  }
}
