import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}
  get name(): string {
    return this.configService.get('app.name');
  }
  get environment(): string {
    return this.configService.get('app.environment');
  }
  get port(): string {
    return this.configService.get('app.port');
  }
}
