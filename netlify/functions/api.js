import serverless from "serverless-http";
import importedApp from "../../server/index.js";

const app = importedApp?.default || importedApp;

export const handler = serverless(app);
