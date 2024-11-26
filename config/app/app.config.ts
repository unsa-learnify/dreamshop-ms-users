import { registerAs } from "@nestjs/config";

export default registerAs('app', () => ({
  name: process.env.APP_NAME,
  environment: process.env.APP_ENV,
  port: process.env.APP_PORT,
}));
