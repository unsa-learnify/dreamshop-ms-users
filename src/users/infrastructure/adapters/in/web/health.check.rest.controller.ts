import { Controller, Get } from "@nestjs/common";

@Controller('/')
export class HealthCheckRestController {
  @Get()
  public healthCheck(): string {
    return 'OK';
  }
}
