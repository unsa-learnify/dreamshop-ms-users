import { registerAs } from "@nestjs/config";

export default registerAs('keycloak', () => ({
  serverUrl: process.env.KEYCLOAK_SERVER_URL,
  clientRealm: process.env.KEYCLOAK_CLIENT_REALM,
  clientId: process.env.KEYCLOAK_CLIENT_ID,
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  adminSecret: process.env.KEYCLOAK_ADMIN_SECRET,
}));
