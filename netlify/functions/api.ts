import serverless from "serverless-http";
import app from "../../server";
import type { Config } from "@netlify/functions";

export const handler = serverless(app);

export const config: Config = {
  path: "/api/*",
};
