import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { KeycloakConfigService } from "./keycloak.config.service";
import * as Joi from "joi";
import keycloakConfig from "./keycloak.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [keycloakConfig],
      validationSchema: Joi.object({
        KEYCLOAK_SERVER_URL: Joi.string().required(),
        KEYCLOAK_CLIENT_REALM: Joi.string().required(),
        KEYCLOAK_CLIENT_ID: Joi.string().required(),
        KEYCLOAK_CLIENT_SECRET: Joi.string().required(),
        KEYCLOAK_ADMIN_SECRET: Joi.string().required(),
      }),
    }),
  ],
  providers: [KeycloakConfigService],
  exports: [KeycloakConfigService],
})
export class KeycloakConfigModule {}
